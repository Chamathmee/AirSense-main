
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_predict_valid_input():
    response = client.post(
        "/predict",
        json={
            "pm25": 24.0,
            "pm10": 46.0,
            "temperature": 30.0,
            "humidity": 68.0,
            "wind_speed": 2.5,
        },
    )

    assert response.status_code == 200

    data = response.json()
    assert "aqi" in data
    assert "category" in data
    assert "advice" in data
    assert isinstance(data["aqi"], (int, float))


def test_predict_rejects_non_numeric_input():
    response = client.post(
        "/predict",
        json={
            "pm25": "invalid",
            "pm10": 46.0,
            "temperature": 30.0,
            "humidity": 68.0,
            "wind_speed": 2.5,
        },
    )

    assert response.status_code == 422


def test_predict_rejects_negative_pm25():
    response = client.post(
        "/predict",
        json={
            "pm25": -1.0,
            "pm10": 46.0,
            "temperature": 30.0,
            "humidity": 68.0,
            "wind_speed": 2.5,
        },
    )

    assert response.status_code == 422


def test_predict_rejects_missing_field():
    response = client.post(
        "/predict",
        json={
            "pm25": 24.0,
            "pm10": 46.0,
            "temperature": 30.0,
            "humidity": 68.0,
        },
    )

    assert response.status_code == 422
