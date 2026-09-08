import os
import datetime
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib

from backend.ml.generate_dataset import generate_synthetic_incidents
from backend.ml.feature_engineering import IncidentFeatureExtractor
from backend.ml.evaluate import evaluate_classifier, evaluate_regressor
from backend.ml.model_manager import save_model_artifacts, MODELS_DIR

def run_training_pipeline(db_incidents_list: list = None, model_version: str = "1.0.0") -> dict:
    os.makedirs(MODELS_DIR, exist_ok=True)

    # 1. Generate bootstrap synthetic data
    df_synthetic = generate_synthetic_incidents(num_samples=1000, random_seed=42)
    synthetic_count = len(df_synthetic)

    # 2. Process Real DB Incidents with Ground-Truth Enforcement
    real_verified_count = 0
    real_unverified_count = 0
    processed_real_records = []

    if db_incidents_list and len(db_incidents_list) > 0:
        for item in db_incidents_list:
            is_verified = item.get("verified", False)
            
            # Extract ground-truth labels (NEVER train on unverified ML output)
            if is_verified:
                real_verified_count += 1
                source_tag = "REAL_VERIFIED"
                target_severity = item.get("verified_severity") or item.get("severity")
                target_score = item.get("verified_risk_score") if item.get("verified_risk_score") is not None else item.get("risk_score")
            else:
                real_unverified_count += 1
                source_tag = "REAL_UNVERIFIED"
                target_severity = item.get("severity")
                target_score = item.get("rule_based_score") or item.get("risk_score")

            processed_real_records.append({
                "id": item.get("id"),
                "description": item.get("description", ""),
                "location": item.get("location", "Main Site"),
                "department": item.get("department", "Manufacturing"),
                "category": item.get("category", "Other"),
                "people_affected": item.get("people_affected", 0),
                "injury_reported": item.get("injury_reported", False),
                "hazards": item.get("hazards", []),
                "hazard_count": len(item.get("hazards", [])) if item.get("hazards") else 1,
                "rule_based_score": item.get("rule_based_score") or item.get("risk_score", 50),
                "risk_score": float(target_score),
                "severity": str(target_severity),
                "data_source": source_tag
            })

        df_real = pd.DataFrame(processed_real_records)
        # Duplicate high-quality verified real records to give them higher sample weight
        if real_verified_count > 0:
            df_verified_boost = df_real[df_real["data_source"] == "REAL_VERIFIED"]
            df_combined = pd.concat([df_synthetic, df_real, df_verified_boost, df_verified_boost], ignore_index=True)
        else:
            df_combined = pd.concat([df_synthetic, df_real], ignore_index=True)
    else:
        df_combined = df_synthetic

    total_records = len(df_combined)

    # 3. Feature Engineering
    feature_extractor = IncidentFeatureExtractor()
    X, feature_names = feature_extractor.fit_transform(df_combined)

    y_severity = df_combined["severity"].astype(str).values
    y_risk_score = df_combined["risk_score"].astype(float).values

    # Train/test split (80/20)
    X_train, X_test, y_sev_train, y_sev_test, y_score_train, y_score_test = train_test_split(
        X, y_severity, y_risk_score, test_size=0.2, random_state=42, stratify=y_severity
    )

    # 4. Train RandomForestClassifier for Severity
    clf = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1)
    clf.fit(X_train, y_sev_train)
    sev_preds = clf.predict(X_test)
    clf_metrics = evaluate_classifier(y_sev_test, sev_preds)

    # 5. Train RandomForestRegressor for Risk Score
    reg = RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1)
    reg.fit(X_train, y_score_train)
    score_preds = reg.predict(X_test)
    reg_metrics = evaluate_regressor(y_score_test, score_preds)

    # Calculate Feature Importances for top display
    importances = clf.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]
    
    top_features = []
    readable_name_map = {
        "people_affected": "Affected Personnel Count",
        "injury_reported": "Worker Injury Reported",
        "hazard_count": "Detected Hazard Count",
        "rule_based_score": "Rule Engine Base Score",
        "cat_category_Chemical": "Chemical Hazard Category",
        "cat_category_Electrical": "Electrical Hazard Category",
        "cat_category_Fire": "Fire Hazard Category",
        "cat_category_Slip/Fall": "Slip/Fall Category",
        "cat_category_Equipment/Machinery": "Machinery Hazard Category",
        "cat_category_Gas Leak": "Gas Leak Category",
        "cat_category_Forklift": "Forklift Collision Category",
        "cat_category_PPE Violation": "PPE Non-Compliance Category"
    }

    for idx in sorted_idx[:15]:
        raw_name = feature_names[idx]
        if raw_name.startswith("tfidf_"):
            clean_label = f"Text Signal: '{raw_name.replace('tfidf_', '')}'"
        else:
            clean_label = readable_name_map.get(raw_name, raw_name.replace("cat_", "").replace("num_", ""))
        
        top_features.append({
            "feature": clean_label,
            "importance": round(float(importances[idx]), 4)
        })

    # 6. Save artifacts and metadata
    metadata = {
        "model_version": model_version,
        "trained_at": datetime.datetime.utcnow().isoformat(),
        "total_records": total_records,
        "real_records": real_verified_count + real_unverified_count,
        "real_verified_records": real_verified_count,
        "real_unverified_records": real_unverified_count,
        "synthetic_records": synthetic_count,
        "accuracy": clf_metrics["accuracy"],
        "f1_score": clf_metrics["f1_score"],
        "precision": clf_metrics["precision"],
        "recall": clf_metrics["recall"],
        "mae": reg_metrics["mae"],
        "rmse": reg_metrics["rmse"],
        "r2_score": reg_metrics["r2_score"],
        "top_features": top_features[:10]
    }

    save_model_artifacts(
        clf_model=clf,
        reg_model=reg,
        feature_extractor=feature_extractor,
        metadata=metadata
    )

    print(f"[SUCCESS] Trained SafeSense Hybrid ML Model v{model_version} with Ground-Truth Real Records ({real_verified_count} verified)")
    return metadata

if __name__ == "__main__":
    run_training_pipeline()
