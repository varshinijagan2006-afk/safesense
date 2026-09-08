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

    # 1. Generate / load synthetic data
    df_synthetic = generate_synthetic_incidents(num_samples=1000, random_seed=42)
    synthetic_count = len(df_synthetic)

    # 2. Combine with real DB incidents if provided
    real_count = 0
    if db_incidents_list and len(db_incidents_list) > 0:
        df_real = pd.DataFrame(db_incidents_list)
        df_real["data_source"] = "REAL"
        real_count = len(df_real)
        # Ensure column alignment
        combined_df = pd.concat([df_synthetic, df_real], ignore_index=True)
    else:
        combined_df = df_synthetic

    total_records = len(combined_df)

    # 3. Feature engineering
    feature_extractor = IncidentFeatureExtractor()
    X, feature_names = feature_extractor.fit_transform(combined_df)

    y_severity = combined_df["severity"].astype(str).values
    y_risk_score = combined_df["risk_score"].astype(float).values

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
        "real_records": real_count,
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

    print(f"[SUCCESS] Trained SafeSense Hybrid ML Model v{model_version}")
    print(f"   Accuracy: {clf_metrics['accuracy']*100:.1f}%, F1: {clf_metrics['f1_score']:.3f}, Risk MAE: {reg_metrics['mae']}")
    return metadata

if __name__ == "__main__":
    run_training_pipeline()
