import numpy as np
import pandas as pd
from scipy.sparse import hstack, csr_matrix
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from typing import Tuple, List, Dict, Any

CATEGORICAL_COLS = ["department", "category"]
NUMERIC_COLS = ["people_affected", "injury_reported", "hazard_count", "rule_based_score"]

class IncidentFeatureExtractor:
    def __init__(self):
        self.tfidf = TfidfVectorizer(
            max_features=100,
            ngram_range=(1, 2),
            stop_words="english",
            lowercase=True
        )
        self.column_transformer = ColumnTransformer(
            transformers=[
                ("num", Pipeline([
                    ("imputer", SimpleImputer(strategy="median")),
                    ("scaler", StandardScaler())
                ]), NUMERIC_COLS),
                ("cat", Pipeline([
                    ("imputer", SimpleImputer(strategy="most_frequent")),
                    ("ohe", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
                ]), CATEGORICAL_COLS)
            ]
        )
        self.feature_names_ = []

    def fit_transform(self, df: pd.DataFrame) -> Tuple[np.ndarray, List[str]]:
        df_clean = self._preprocess_df(df)
        
        # 1. Fit TF-IDF on descriptions
        tfidf_features = self.tfidf.fit_transform(df_clean["description"].fillna("")).toarray()
        tfidf_feature_names = [f"tfidf_{w}" for w in self.tfidf.get_feature_names_out()]

        # 2. Fit ColumnTransformer on structured features
        struct_features = self.column_transformer.fit_transform(df_clean)
        
        # Extract structured feature names
        cat_encoder = self.column_transformer.named_transformers_["cat"].named_steps["ohe"]
        cat_feature_names = cat_encoder.get_feature_names_out(CATEGORICAL_COLS).tolist()
        num_feature_names = NUMERIC_COLS
        struct_feature_names = num_feature_names + cat_feature_names

        # Combine
        X_combined = np.hstack([struct_features, tfidf_features])
        self.feature_names_ = struct_feature_names + tfidf_feature_names

        return X_combined, self.feature_names_

    def transform(self, df: pd.DataFrame) -> np.ndarray:
        df_clean = self._preprocess_df(df)
        tfidf_features = self.tfidf.transform(df_clean["description"].fillna("")).toarray()
        struct_features = self.column_transformer.transform(df_clean)
        X_combined = np.hstack([struct_features, tfidf_features])
        return X_combined

    def _preprocess_df(self, df: pd.DataFrame) -> pd.DataFrame:
        df_copy = df.copy()
        if "injury_reported" in df_copy.columns:
            df_copy["injury_reported"] = df_copy["injury_reported"].astype(int)
        if "hazard_count" not in df_copy.columns:
            if "hazards" in df_copy.columns:
                df_copy["hazard_count"] = df_copy["hazards"].apply(lambda h: len(h) if isinstance(h, list) else 1)
            else:
                df_copy["hazard_count"] = 1
        if "rule_based_score" not in df_copy.columns:
            df_copy["rule_based_score"] = df_copy.get("risk_score", 50)
        
        for col in ["description", "location", "department", "category"]:
            if col not in df_copy.columns:
                df_copy[col] = "Other"
            else:
                df_copy[col] = df_copy[col].fillna("Other").astype(str)

        for col in ["people_affected", "injury_reported", "hazard_count", "rule_based_score"]:
            if col not in df_copy.columns:
                df_copy[col] = 0
            else:
                df_copy[col] = pd.to_numeric(df_copy[col], errors="coerce").fillna(0)

        return df_copy
