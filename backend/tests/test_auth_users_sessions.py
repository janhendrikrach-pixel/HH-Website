"""
Backend API Tests for Student/Trainer System
Tests: Auth endpoints, User CRUD, Sessions, Attendance, Notifications
"""
import pytest
import requests
import os
from base64 import b64encode
from datetime import datetime, timedelta

# Get the base URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    BASE_URL = "https://trainer-portal-51.preview.emergentagent.com"

# Admin credentials
ADMIN_USER = "admin"
ADMIN_PASS = "headlock2024"

# Test user credentials (pre-seeded)
TEST_STUDENT_EMAIL = "max@test.de"
TEST_STUDENT_PASS = "test1234"
TEST_TRAINER_EMAIL = "leon@test.de"
TEST_TRAINER_PASS = "coach1234"

def get_admin_auth_header():
    """Get Basic Auth header for admin requests"""
    credentials = f"{ADMIN_USER}:{ADMIN_PASS}"
    encoded = b64encode(credentials.encode()).decode()
    return {"Authorization": f"Basic {encoded}"}

def get_jwt_token(email: str, password: str) -> str:
    """Get JWT token for user login"""
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        data={"username": email, "password": password},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    if response.status_code == 200:
        return response.json()["access_token"]
    return None

def get_bearer_header(token: str):
    """Get Bearer token header"""
    return {"Authorization": f"Bearer {token}"}


# ==================== AUTH ENDPOINT TESTS ====================

class TestAuthEndpoints:
    """Tests for authentication endpoints using JWT"""

    def test_login_student_success(self):
        """Test student login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            data={"username": TEST_STUDENT_EMAIL, "password": TEST_STUDENT_PASS},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "user" in data
        assert data["user"]["email"] == TEST_STUDENT_EMAIL
        assert data["user"]["role"] == "student"
        print(f"✓ Student login successful: {data['user']['name']}")

    def test_login_trainer_success(self):
        """Test trainer login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            data={"username": TEST_TRAINER_EMAIL, "password": TEST_TRAINER_PASS},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == TEST_TRAINER_EMAIL
        assert data["user"]["role"] == "trainer"
        print(f"✓ Trainer login successful: {data['user']['name']}")

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            data={"username": "wrong@test.de", "password": "wrongpass"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert response.status_code == 401
        print(f"✓ Invalid credentials correctly rejected")

    def test_login_empty_fields(self):
        """Test login with empty fields"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            data={"username": "", "password": ""},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert response.status_code in [401, 422]
        print(f"✓ Empty credentials correctly rejected")

    def test_auth_me_with_valid_token(self):
        """Test GET /auth/me with valid JWT token"""
        token = get_jwt_token(TEST_STUDENT_EMAIL, TEST_STUDENT_PASS)
        assert token is not None, "Failed to get token"
        
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers=get_bearer_header(token)
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == TEST_STUDENT_EMAIL
        assert data["role"] == "student"
        assert "id" in data
        print(f"✓ GET /auth/me returned user info: {data['name']}")

    def test_auth_me_without_token(self):
        """Test GET /auth/me without token - should fail"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print(f"✓ GET /auth/me without token correctly rejected")

    def test_auth_me_with_invalid_token(self):
        """Test GET /auth/me with invalid token"""
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": "Bearer invalid.token.here"}
        )
        assert response.status_code == 401
        print(f"✓ Invalid token correctly rejected")


# ==================== PROFILE UPDATE TESTS ====================

class TestProfileUpdate:
    """Tests for profile update functionality"""

    def test_update_profile_name(self):
        """Test updating profile name"""
        token = get_jwt_token(TEST_STUDENT_EMAIL, TEST_STUDENT_PASS)
        
        # Get current user info
        current = requests.get(f"{BASE_URL}/api/auth/me", headers=get_bearer_header(token)).json()
        original_name = current["name"]
        
        # Update name
        response = requests.put(
            f"{BASE_URL}/api/auth/profile",
            json={"name": "TEST_Updated Name"},
            headers=get_bearer_header(token)
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "TEST_Updated Name"
        print(f"✓ Profile name updated successfully")
        
        # Restore original name
        requests.put(
            f"{BASE_URL}/api/auth/profile",
            json={"name": original_name},
            headers=get_bearer_header(token)
        )
        print(f"✓ Profile name restored to original")

    def test_update_profile_multiple_fields(self):
        """Test updating multiple profile fields"""
        token = get_jwt_token(TEST_STUDENT_EMAIL, TEST_STUDENT_PASS)
        
        updates = {
            "phone": "TEST_0987654321",
            "bio": "TEST_This is my bio",
            "experience_level": "intermediate",
            "emergency_contact": "TEST_Emergency 12345"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/auth/profile",
            json=updates,
            headers=get_bearer_header(token)
        )
        assert response.status_code == 200
        data = response.json()
        for key, value in updates.items():
            assert data[key] == value
        print(f"✓ Multiple profile fields updated successfully")
        
        # Cleanup - restore empty fields
        requests.put(
            f"{BASE_URL}/api/auth/profile",
            json={"phone": "0170123456", "bio": "", "experience_level": "", "emergency_contact": ""},
            headers=get_bearer_header(token)
        )


# ==================== ADMIN USER MANAGEMENT TESTS ====================

class TestAdminUserManagement:
    """Tests for admin user CRUD operations"""

    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - store user IDs for cleanup"""
        self.created_user_ids = []
        yield
        # Cleanup created users
        for user_id in self.created_user_ids:
            requests.delete(
                f"{BASE_URL}/api/admin/users/{user_id}",
                headers=get_admin_auth_header()
            )

    def test_admin_get_users(self):
        """Test admin can retrieve all users"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers=get_admin_auth_header()
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Should have at least the 2 pre-seeded users
        assert len(data) >= 2
        print(f"✓ Admin retrieved {len(data)} users")
        
        # Verify user structure
        for user in data:
            assert "id" in user
            assert "email" in user
            assert "role" in user
            assert "password_hash" not in user  # Should not expose password hash
        print(f"✓ User structure verified (password_hash not exposed)")

    def test_admin_create_student(self):
        """Test admin can create a student user"""
        user_data = {
            "name": "TEST_New Student",
            "email": "test_newstudent@test.de",
            "password": "testpassword123",
            "role": "student",
            "phone": "0123456789"
        }
        response = requests.post(
            f"{BASE_URL}/api/admin/users",
            json=user_data,
            headers=get_admin_auth_header()
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == user_data["name"]
        assert data["email"] == user_data["email"]
        assert data["role"] == "student"
        assert "id" in data
        self.created_user_ids.append(data["id"])
        print(f"✓ Student user created: {data['id']}")
        
        # Verify can login with new user
        login_resp = requests.post(
            f"{BASE_URL}/api/auth/login",
            data={"username": user_data["email"], "password": user_data["password"]},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert login_resp.status_code == 200
        print(f"✓ New student can login successfully")

    def test_admin_create_trainer(self):
        """Test admin can create a trainer user"""
        user_data = {
            "name": "TEST_New Trainer",
            "email": "test_newtrainer@test.de",
            "password": "trainerpass123",
            "role": "trainer",
            "phone": "0987654321"
        }
        response = requests.post(
            f"{BASE_URL}/api/admin/users",
            json=user_data,
            headers=get_admin_auth_header()
        )
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == "trainer"
        self.created_user_ids.append(data["id"])
        print(f"✓ Trainer user created: {data['id']}")

    def test_admin_create_duplicate_email_rejected(self):
        """Test duplicate email is rejected"""
        response = requests.post(
            f"{BASE_URL}/api/admin/users",
            json={
                "name": "Duplicate",
                "email": TEST_STUDENT_EMAIL,  # Existing email
                "password": "test123",
                "role": "student"
            },
            headers=get_admin_auth_header()
        )
        assert response.status_code == 400
        print(f"✓ Duplicate email correctly rejected")

    def test_admin_create_invalid_role_rejected(self):
        """Test invalid role is rejected"""
        response = requests.post(
            f"{BASE_URL}/api/admin/users",
            json={
                "name": "Invalid Role",
                "email": "invalid_role@test.de",
                "password": "test123",
                "role": "admin"  # Invalid role
            },
            headers=get_admin_auth_header()
        )
        assert response.status_code == 400
        print(f"✓ Invalid role correctly rejected")

    def test_admin_update_user(self):
        """Test admin can update user"""
        # Create user first
        create_resp = requests.post(
            f"{BASE_URL}/api/admin/users",
            json={
                "name": "TEST_ToUpdate",
                "email": "test_update@test.de",
                "password": "test123",
                "role": "student"
            },
            headers=get_admin_auth_header()
        )
        user_id = create_resp.json()["id"]
        self.created_user_ids.append(user_id)
        
        # Update user
        update_resp = requests.put(
            f"{BASE_URL}/api/admin/users/{user_id}",
            json={"name": "TEST_Updated Name", "phone": "0999888777"},
            headers=get_admin_auth_header()
        )
        assert update_resp.status_code == 200
        data = update_resp.json()
        assert data["name"] == "TEST_Updated Name"
        assert data["phone"] == "0999888777"
        print(f"✓ User updated successfully")

    def test_admin_toggle_user_active(self):
        """Test admin can toggle user active status"""
        # Create user
        create_resp = requests.post(
            f"{BASE_URL}/api/admin/users",
            json={
                "name": "TEST_ToggleActive",
                "email": "test_toggle@test.de",
                "password": "test123",
                "role": "student"
            },
            headers=get_admin_auth_header()
        )
        user_id = create_resp.json()["id"]
        self.created_user_ids.append(user_id)
        
        # Deactivate user
        deactivate_resp = requests.put(
            f"{BASE_URL}/api/admin/users/{user_id}",
            json={"is_active": False},
            headers=get_admin_auth_header()
        )
        assert deactivate_resp.status_code == 200
        assert deactivate_resp.json()["is_active"] == False
        print(f"✓ User deactivated successfully")
        
        # Verify deactivated user cannot login
        login_resp = requests.post(
            f"{BASE_URL}/api/auth/login",
            data={"username": "test_toggle@test.de", "password": "test123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert login_resp.status_code == 401
        print(f"✓ Deactivated user cannot login")

    def test_admin_delete_user(self):
        """Test admin can delete user"""
        # Create user
        create_resp = requests.post(
            f"{BASE_URL}/api/admin/users",
            json={
                "name": "TEST_ToDelete",
                "email": "test_delete@test.de",
                "password": "test123",
                "role": "student"
            },
            headers=get_admin_auth_header()
        )
        user_id = create_resp.json()["id"]
        
        # Delete user
        delete_resp = requests.delete(
            f"{BASE_URL}/api/admin/users/{user_id}",
            headers=get_admin_auth_header()
        )
        assert delete_resp.status_code == 200
        assert delete_resp.json()["status"] == "deleted"
        print(f"✓ User deleted successfully")
        
        # Verify user cannot be retrieved
        users = requests.get(f"{BASE_URL}/api/admin/users", headers=get_admin_auth_header()).json()
        found = any(u["id"] == user_id for u in users)
        assert not found
        print(f"✓ Deleted user not in user list")


# ==================== TRAINING SESSION TESTS ====================

class TestTrainingSessions:
    """Tests for training session management"""

    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - get tokens and store session IDs for cleanup"""
        self.trainer_token = get_jwt_token(TEST_TRAINER_EMAIL, TEST_TRAINER_PASS)
        self.student_token = get_jwt_token(TEST_STUDENT_EMAIL, TEST_STUDENT_PASS)
        self.created_session_ids = []
        
        # Get a valid schedule ID
        schedule = requests.get(f"{BASE_URL}/api/schedule").json()
        self.schedule_id = schedule[0]["id"] if schedule else None
        
        # Get a valid coach ID from trainers
        trainers = requests.get(f"{BASE_URL}/api/trainers").json()
        self.coach_id = trainers[0]["id"] if trainers else None
        self.coach_name = trainers[0]["name"] if trainers else "Test Coach"
        
        yield
        # Cleanup sessions
        for session_id in self.created_session_ids:
            requests.delete(
                f"{BASE_URL}/api/sessions/{session_id}",
                headers=get_bearer_header(self.trainer_token)
            )

    def test_trainer_create_session(self):
        """Test trainer can create a training session"""
        if not self.schedule_id or not self.coach_id:
            pytest.skip("No schedule or trainers available")
        
        future_date = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        session_data = {
            "schedule_id": self.schedule_id,
            "date": future_date,
            "coach_id": self.coach_id,
            "coach_name": self.coach_name,
            "notes_de": "TEST_Training",
            "notes_en": "TEST_Training",
            "max_participants": 20,
            "is_cancelled": False
        }
        
        response = requests.post(
            f"{BASE_URL}/api/sessions",
            json=session_data,
            headers=get_bearer_header(self.trainer_token)
        )
        assert response.status_code == 200
        data = response.json()
        assert data["date"] == future_date
        assert data["coach_name"] == self.coach_name
        assert "id" in data
        self.created_session_ids.append(data["id"])
        print(f"✓ Training session created: {data['id']}")

    def test_student_cannot_create_session(self):
        """Test student cannot create session (403)"""
        if not self.schedule_id:
            pytest.skip("No schedule available")
            
        session_data = {
            "schedule_id": self.schedule_id,
            "date": "2026-12-01",
            "coach_id": "test",
            "coach_name": "Test",
            "max_participants": 20,
            "is_cancelled": False
        }
        
        response = requests.post(
            f"{BASE_URL}/api/sessions",
            json=session_data,
            headers=get_bearer_header(self.student_token)
        )
        assert response.status_code == 403
        print(f"✓ Student correctly forbidden from creating session")

    def test_trainer_get_all_sessions(self):
        """Test trainer can get all sessions with attendance"""
        response = requests.get(
            f"{BASE_URL}/api/sessions/all",
            headers=get_bearer_header(self.trainer_token)
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Trainer retrieved {len(data)} sessions")
        
        # Check session structure
        if data:
            session = data[0]
            assert "attendees" in session
            assert "confirmed_count" in session
            assert "declined_count" in session
            assert "pending_count" in session
            print(f"✓ Session structure verified with attendance counts")

    def test_student_cannot_get_all_sessions(self):
        """Test student cannot access all sessions endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/sessions/all",
            headers=get_bearer_header(self.student_token)
        )
        assert response.status_code == 403
        print(f"✓ Student correctly forbidden from all sessions view")

    def test_student_get_sessions(self):
        """Test student can get their sessions with RSVP status"""
        response = requests.get(
            f"{BASE_URL}/api/sessions",
            headers=get_bearer_header(self.student_token)
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Student retrieved {len(data)} upcoming sessions")
        
        # Check session has my_status field
        if data:
            assert "my_status" in data[0]
            print(f"✓ Session has my_status field for RSVP")


# ==================== ATTENDANCE/RSVP TESTS ====================

class TestAttendanceRSVP:
    """Tests for student attendance/RSVP functionality"""

    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - create a test session for attendance tests"""
        self.trainer_token = get_jwt_token(TEST_TRAINER_EMAIL, TEST_TRAINER_PASS)
        self.student_token = get_jwt_token(TEST_STUDENT_EMAIL, TEST_STUDENT_PASS)
        
        # Get schedule and trainers
        schedule = requests.get(f"{BASE_URL}/api/schedule").json()
        trainers = requests.get(f"{BASE_URL}/api/trainers").json()
        
        if schedule and trainers:
            future_date = (datetime.now() + timedelta(days=10)).strftime("%Y-%m-%d")
            session_data = {
                "schedule_id": schedule[0]["id"],
                "date": future_date,
                "coach_id": trainers[0]["id"],
                "coach_name": trainers[0]["name"],
                "notes_de": "TEST_RSVP Session",
                "max_participants": 20,
                "is_cancelled": False
            }
            
            resp = requests.post(
                f"{BASE_URL}/api/sessions",
                json=session_data,
                headers=get_bearer_header(self.trainer_token)
            )
            if resp.status_code == 200:
                self.session_id = resp.json()["id"]
            else:
                self.session_id = None
        else:
            self.session_id = None
        
        yield
        
        # Cleanup
        if self.session_id:
            requests.delete(
                f"{BASE_URL}/api/sessions/{self.session_id}",
                headers=get_bearer_header(self.trainer_token)
            )

    def test_student_confirm_attendance(self):
        """Test student can confirm attendance"""
        if not self.session_id:
            pytest.skip("No test session available")
        
        response = requests.put(
            f"{BASE_URL}/api/attendance/{self.session_id}",
            json={"status": "confirmed"},
            headers=get_bearer_header(self.student_token)
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "updated"
        assert data["attendance_status"] == "confirmed"
        print(f"✓ Student confirmed attendance")

    def test_student_decline_attendance(self):
        """Test student can decline attendance"""
        if not self.session_id:
            pytest.skip("No test session available")
        
        response = requests.put(
            f"{BASE_URL}/api/attendance/{self.session_id}",
            json={"status": "declined"},
            headers=get_bearer_header(self.student_token)
        )
        assert response.status_code == 200
        data = response.json()
        assert data["attendance_status"] == "declined"
        print(f"✓ Student declined attendance")

    def test_invalid_attendance_status_rejected(self):
        """Test invalid attendance status is rejected"""
        if not self.session_id:
            pytest.skip("No test session available")
        
        response = requests.put(
            f"{BASE_URL}/api/attendance/{self.session_id}",
            json={"status": "maybe"},
            headers=get_bearer_header(self.student_token)
        )
        assert response.status_code == 400
        print(f"✓ Invalid attendance status correctly rejected")

    def test_trainer_view_attendance(self):
        """Test trainer can view session attendance"""
        if not self.session_id:
            pytest.skip("No test session available")
        
        response = requests.get(
            f"{BASE_URL}/api/attendance/{self.session_id}",
            headers=get_bearer_header(self.trainer_token)
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Trainer retrieved {len(data)} attendance records")

    def test_student_cannot_view_attendance_list(self):
        """Test student cannot view full attendance list"""
        if not self.session_id:
            pytest.skip("No test session available")
        
        response = requests.get(
            f"{BASE_URL}/api/attendance/{self.session_id}",
            headers=get_bearer_header(self.student_token)
        )
        assert response.status_code == 403
        print(f"✓ Student correctly forbidden from viewing attendance list")


# ==================== NOTIFICATION TESTS ====================

class TestNotifications:
    """Tests for notification functionality"""

    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - get student token"""
        self.student_token = get_jwt_token(TEST_STUDENT_EMAIL, TEST_STUDENT_PASS)
        yield

    def test_get_notifications(self):
        """Test user can get their notifications"""
        response = requests.get(
            f"{BASE_URL}/api/notifications",
            headers=get_bearer_header(self.student_token)
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Retrieved {len(data)} notifications")
        
        # Check notification structure
        if data:
            notif = data[0]
            assert "id" in notif
            assert "message_de" in notif
            assert "message_en" in notif
            assert "is_read" in notif
            print(f"✓ Notification structure verified")

    def test_mark_notification_read(self):
        """Test user can mark notification as read"""
        # Get notifications
        notifs = requests.get(
            f"{BASE_URL}/api/notifications",
            headers=get_bearer_header(self.student_token)
        ).json()
        
        if not notifs:
            pytest.skip("No notifications to test")
        
        notif_id = notifs[0]["id"]
        
        response = requests.put(
            f"{BASE_URL}/api/notifications/{notif_id}/read",
            headers=get_bearer_header(self.student_token)
        )
        assert response.status_code == 200
        print(f"✓ Notification marked as read")

    def test_mark_all_notifications_read(self):
        """Test user can mark all notifications as read"""
        response = requests.put(
            f"{BASE_URL}/api/notifications/read-all",
            headers=get_bearer_header(self.student_token)
        )
        assert response.status_code == 200
        assert response.json()["status"] == "all_read"
        print(f"✓ All notifications marked as read")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
