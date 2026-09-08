import pandas as pd
import numpy as np
from typing import Dict, Any, Optional
from backend.ml.model_manager import load_model_artifacts

_CACHED_CLF = None
_CACHED_REG = None
_CACHED_EXTRACTOR = None
_CACHED_METADATA = None

def get_loaded_models():
    global _CACHED_CLF, _CACHED_REG, _CACHED_EXTRACTOR, _CACHED_METADATA
    if _CACHED_CLF is None or _CACHED_REG is None or _CACHED_EXTRACTOR is None:
        _CACHED_CLF, _CACHED_REG, _CACHED_EXTRACTOR, _CACHED_METADATA = load_model_artifacts()
    return _CACHED_CLF, _CACHED_REG, _CACHED_EXTRACTOR, _CACHED_METADATA

def reload_models():
    global _CACHED_CLF, _CACHED_REG, _CACHED_EXTRACTOR, _CACHED_METADATA
    _CACHED_CLF, _CACHED_REG, _CACHED_EXTRACTOR, _CACHED_METADATA = load_model_artifacts()
    return _CACHED_CLF is not None

def predict_ml_risk(
    description: str,
    location: str = "Main Site",
    department: str = "Manufacturing",
    category: str = "Other",
    people_affected: int = 0,
    injury_reported: bool = False,
    hazards: list = None,
    rule_score: int = 50
) -> Optional[Dict[str, Any]]:
    clf, reg, extractor, metadata = get_loaded_models()
    if not clf or not reg or not extractor:
        return None

    try:
        sample_df = pd.DataFrame([{
            "description": description or "",
            "location": location or "Main Site",
            "department": department or "Manufacturing",
            "category": category or "Other",
            "people_affected": people_affected or 0,
            "injury_reported": 1 if injury_reported else 0,
            "hazards": hazards or [],
            "hazard_count": len(hazards) if hazards else 1,
            "rule_based_score": rule_score
        }])

        X = extractor.transform(sample_df)

        # Regressor prediction for risk score
        predicted_score_raw = reg.predict(X)[0]
        ml_risk_score = int(round(min(100, max(0, predicted_score_raw))))

        # Classifier prediction for severity
        ml_severity = str(clf.predict(X)[0])

        # Prediction probability confidence
        if hasattr(clf, "predict_proba"):
            probs = clf.predict_proba(X)[0]
            confidence = float(np.max(probs))
        else:
            confidence = 0.85

        return {
            "ml_risk_score": ml_risk_score,
            "ml_severity": ml_severity,
            "confidence": round(confidence, 2),
            "model_version": metadata.get("model_version", "1.0.0") if metadata else "1.0.0"
        }
    except Exception as e:
        print(f"[WARNING] ML prediction failed: {e}")
        return None

def compute_hybrid_risk_assessment(
    rule_result: Dict[str, Any],
    description: str,
    location: str,
    department: str,
    people_affected: int,
    injury_reported: bool
) -> Dict[str, Any]:
    rule_score = rule_result["risk_score"]
    
    ml_result = predict_ml_risk(
        description=description,
        location=location,
        department=department,
        category=rule_result.get("category", "Other"),
        people_affected=people_affected,
        injury_reported=injury_reported,
        hazards=rule_result.get("hazards", []),
        rule_score=rule_score
    )

    if ml_result is not None:
        ml_score = ml_result["ml_risk_score"]
        # Weighted combination: 60% Rule-based + 40% ML-predicted
        hybrid_score = int(round(0.60 * rule_score + 0.40 * ml_score))
        hybrid_score = min(100, max(0, hybrid_score))

        # Severity classification
        if hybrid_score >= 75:
            final_severity = "CRITICAL"
        elif hybrid_score >= 55:
            final_severity = "HIGH"
        elif hybrid_score >= 30:
            final_severity = "MEDIUM"
        else:
            final_severity = "LOW"

        # Combine explanations
        original_exp = rule_result.get("explanation", "")
        ml_exp_part = (
            f" Machine learning pattern analysis predicted risk index {ml_score}/100 ({ml_result['ml_severity']} severity) "
            f"with {int(ml_result['confidence']*100)}% model confidence. The final hybrid score of {hybrid_score}/100 blends "
            f"rule-based domain safety policies with historical machine learning models."
        )
        combined_explanation = original_exp + ml_exp_part

        res = dict(rule_result)
        res["risk_score"] = hybrid_score
        res["severity"] = final_severity
        res["rule_based_score"] = rule_score
        res["ml_predicted_score"] = ml_score
        res["ml_severity"] = ml_result["ml_severity"]
        res["ml_confidence"] = ml_result["confidence"]
        res["prediction_source"] = "hybrid"
        res["explanation"] = combined_explanation
        return res
    else:
        # Fallback to rule engine
        res = dict(rule_result)
        res["rule_based_score"] = rule_score
        res["ml_predicted_score"] = rule_score
        res["ml_severity"] = rule_result["severity"]
        res["ml_confidence"] = 0.75
        res["prediction_source"] = "rule_based"
        return res
