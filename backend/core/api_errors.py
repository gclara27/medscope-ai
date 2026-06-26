"""User-facing API error messages (UC-091, RNF-050)."""

from __future__ import annotations

INTERNAL_SERVER_ERROR = "An unexpected error occurred. Please try again later."
NOT_AUTHENTICATED = "Not authenticated"
INSUFFICIENT_PERMISSIONS = "Insufficient permissions"
INVALID_CREDENTIALS = "Invalid email or password"
PREDICTION_NOT_FOUND = "Prediction not found"
PREDICTION_INPUTS_NOT_FOUND = "Prediction clinical inputs not found"
SIMULATION_INPUT_NOT_FOUND = "Patient input not found for prediction"
DATE_RANGE_INVALID = "date_from must be on or before date_to"
ML_SERVICE_UNAVAILABLE = "ML prediction service is unavailable"
