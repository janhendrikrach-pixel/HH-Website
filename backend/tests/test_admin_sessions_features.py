"""
Backend API Tests for Admin Session Management and User Stats
Tests: Admin sessions CRUD, Admin attendance management, User stats with attendance
"""
import pytest
import requests
import os
from base64 import b64encode
from datetime import datetime, timedelta

# Get the base URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    BASE_URL = "https://gym-management-29.preview.emergentagent.com"

# Admin credentials
ADMIN_USER = "admin"
ADMIN_PASS = "headlock2024"

# Test user credentials (pre-seeded)
TEST_STUDENT_EMAIL = "max@test.de"

def get_admin_auth_header():
    """Get Basic Auth header for admin requests"""
    credentials = f"{ADMIN_USER}:{ADMIN_PASS}"
    encoded = b64encode(credentials.encode()).decode()
    return {"Authorization": f"Basic {encoded}"}


# ==================== ADMIN SESSIONS MANAGEMENT TESTS ====================

class TestAdminSessions:
    """Tests for admin training session management"""

    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - get schedule and trainer info, store session IDs for cleanup"""
        self.created_session_ids = []
        
        # Get a valid schedule ID
        schedule = requests.get(f"{BASE_URL}/api/schedule").json()
        self.schedule_id = schedule[0]["id"] if schedule else None
        
        # Get a valid coach ID from trainers
        trainers = requests.get(f"{BASE_URL}/api/trainers").json()
        self.coach_id = trainers[0]["id"] if trainers else None
        self.coach_name = trainers[0]["name"] if trainers else "Test Coach"
        
        yield
        # Cleanup sessions created during tests
        for session_id in self.created_session_ids:
            requests.delete(
                f"{BASE_URL}/api/admin/sessions/{session_id}",
                headers=get_admin_auth_header()
            )

    def test_admin_get_sessions_returns_attendee_details(self):
        """Test GET /api/admin/sessions returns sessions with attendee email/phone"""
        response = requests.get(
            f"{BASE_URL}/api/admin/sessions",
            headers=get_admin_auth_header()
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin retrieved {len(data)} sessions")
        
        # Verify session structure includes attendees with details
        if data:
            session = data[0]
            assert "attendees" in session
            assert "confirmed_count" in session
            assert "declined_count" in session
            assert "pending_count" in session
            print(f"✓ Session has attendance counts")
            
            # Verify attendee structure includes user details
            if session.get("attendees"):
                attendee = session["attendees"][0]
                assert "user_email" in attendee
                assert "user_phone" in attendee
                assert "user_name" in attendee
                assert "status" in attendee
                print(f"✓ Attendee has email: {attendee.get('user_email')}, phone: {attendee.get('user_phone')}")

    def test_admin_create_session(self):
        """Test admin can create a training session"""
        if not self.schedule_id or not self.coach_id:
            pytest.skip("No schedule or trainers available")
        
        future_date = (datetime.now() + timedelta(days=14)).strftime("%Y-%m-%d")
        session_data = {
            "schedule_id": self.schedule_id,
            "date": future_date,
            "coach_id": self.coach_id,
            "coach_name": self.coach_name,
            "notes_de": "TEST_Admin Created Session",
            "notes_en": "TEST_Admin Created Session EN",
            "max_participants": 25,
            "is_cancelled": False
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/sessions",
            json=session_data,
            headers=get_admin_auth_header()
        )
        assert response.status_code == 200
        data = response.json()
        assert data["date"] == future_date
        assert data["coach_name"] == self.coach_name
        assert data["notes_de"] == "TEST_Admin Created Session"
        assert "id" in data
        self.created_session_ids.append(data["id"])
        print(f"✓ Admin created session: {data['id']}")
        
        # Verify session appears in list
        list_resp = requests.get(f"{BASE_URL}/api/admin/sessions", headers=get_admin_auth_header())
        sessions = list_resp.json()
        found = any(s["id"] == data["id"] for s in sessions)
        assert found
        print(f"✓ Created session appears in session list")

    def test_admin_update_session(self):
        """Test admin can update a training session"""
        if not self.schedule_id or not self.coach_id:
            pytest.skip("No schedule or trainers available")
        
        # Create session first
        future_date = (datetime.now() + timedelta(days=15)).strftime("%Y-%m-%d")
        create_resp = requests.post(
            f"{BASE_URL}/api/admin/sessions",
            json={
                "schedule_id": self.schedule_id,
                "date": future_date,
                "coach_id": self.coach_id,
                "coach_name": self.coach_name,
                "notes_de": "TEST_To Update",
                "max_participants": 20,
                "is_cancelled": False
            },
            headers=get_admin_auth_header()
        )
        session_id = create_resp.json()["id"]
        self.created_session_ids.append(session_id)
        
        # Update session
        update_data = {
            "schedule_id": self.schedule_id,
            "date": future_date,
            "coach_id": self.coach_id,
            "coach_name": "Updated Coach Name",
            "notes_de": "TEST_Updated Notes",
            "notes_en": "TEST_Updated Notes EN",
            "max_participants": 15,
            "is_cancelled": True
        }
        
        update_resp = requests.put(
            f"{BASE_URL}/api/admin/sessions/{session_id}",
            json=update_data,
            headers=get_admin_auth_header()
        )
        assert update_resp.status_code == 200
        data = update_resp.json()
        assert data["coach_name"] == "Updated Coach Name"
        assert data["notes_de"] == "TEST_Updated Notes"
        assert data["is_cancelled"] == True
        print(f"✓ Admin updated session successfully")

    def test_admin_delete_session(self):
        """Test admin can delete a training session"""
        if not self.schedule_id or not self.coach_id:
            pytest.skip("No schedule or trainers available")
        
        # Create session first
        future_date = (datetime.now() + timedelta(days=16)).strftime("%Y-%m-%d")
        create_resp = requests.post(
            f"{BASE_URL}/api/admin/sessions",
            json={
                "schedule_id": self.schedule_id,
                "date": future_date,
                "coach_id": self.coach_id,
                "coach_name": self.coach_name,
                "notes_de": "TEST_To Delete",
                "max_participants": 20,
                "is_cancelled": False
            },
            headers=get_admin_auth_header()
        )
        session_id = create_resp.json()["id"]
        
        # Delete session
        delete_resp = requests.delete(
            f"{BASE_URL}/api/admin/sessions/{session_id}",
            headers=get_admin_auth_header()
        )
        assert delete_resp.status_code == 200
        assert delete_resp.json()["status"] == "deleted"
        print(f"✓ Admin deleted session: {session_id}")
        
        # Verify session no longer in list
        list_resp = requests.get(f"{BASE_URL}/api/admin/sessions", headers=get_admin_auth_header())
        sessions = list_resp.json()
        found = any(s["id"] == session_id for s in sessions)
        assert not found
        print(f"✓ Deleted session not in session list")


# ==================== ADMIN ATTENDANCE MANAGEMENT TESTS ====================

class TestAdminAttendanceManagement:
    """Tests for admin manual attendance status changes"""

    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - get existing session and user IDs"""
        # Get existing session with attendees
        sessions_resp = requests.get(f"{BASE_URL}/api/admin/sessions", headers=get_admin_auth_header())
        sessions = sessions_resp.json()
        
        if sessions and sessions[0].get("attendees"):
            self.session_id = sessions[0]["id"]
            self.user_id = sessions[0]["attendees"][0]["user_id"]
            self.original_status = sessions[0]["attendees"][0]["status"]
        else:
            self.session_id = None
            self.user_id = None
            self.original_status = None
        
        yield
        
        # Restore original status if we changed it
        if self.session_id and self.user_id and self.original_status:
            requests.put(
                f"{BASE_URL}/api/admin/attendance/{self.session_id}/{self.user_id}",
                json={"status": self.original_status},
                headers=get_admin_auth_header()
            )

    def test_admin_update_attendance_to_confirmed(self):
        """Test admin can change attendance status to confirmed"""
        if not self.session_id or not self.user_id:
            pytest.skip("No session with attendees available")
        
        response = requests.put(
            f"{BASE_URL}/api/admin/attendance/{self.session_id}/{self.user_id}",
            json={"status": "confirmed"},
            headers=get_admin_auth_header()
        )
        assert response.status_code == 200
        assert response.json()["status"] == "updated"
        print(f"✓ Admin set attendance to confirmed")
        
        # Verify the change
        session_resp = requests.get(f"{BASE_URL}/api/admin/sessions", headers=get_admin_auth_header())
        sessions = session_resp.json()
        session = next((s for s in sessions if s["id"] == self.session_id), None)
        attendee = next((a for a in session["attendees"] if a["user_id"] == self.user_id), None)
        assert attendee["status"] == "confirmed"
        print(f"✓ Verified attendance status is confirmed")

    def test_admin_update_attendance_to_declined(self):
        """Test admin can change attendance status to declined"""
        if not self.session_id or not self.user_id:
            pytest.skip("No session with attendees available")
        
        response = requests.put(
            f"{BASE_URL}/api/admin/attendance/{self.session_id}/{self.user_id}",
            json={"status": "declined"},
            headers=get_admin_auth_header()
        )
        assert response.status_code == 200
        print(f"✓ Admin set attendance to declined")

    def test_admin_update_attendance_to_pending(self):
        """Test admin can change attendance status to pending"""
        if not self.session_id or not self.user_id:
            pytest.skip("No session with attendees available")
        
        response = requests.put(
            f"{BASE_URL}/api/admin/attendance/{self.session_id}/{self.user_id}",
            json={"status": "pending"},
            headers=get_admin_auth_header()
        )
        assert response.status_code == 200
        print(f"✓ Admin set attendance to pending")


# ==================== ADMIN USER STATS TESTS ====================

class TestAdminUserStats:
    """Tests for admin user stats endpoint with attendance statistics"""

    def test_admin_get_user_stats(self):
        """Test GET /api/admin/users/{user_id}/stats returns user with stats and recent sessions"""
        # Get a user first
        users_resp = requests.get(f"{BASE_URL}/api/admin/users", headers=get_admin_auth_header())
        users = users_resp.json()
        
        student = next((u for u in users if u.get("role") == "student"), None)
        if not student:
            pytest.skip("No student user available")
        
        user_id = student["id"]
        
        response = requests.get(
            f"{BASE_URL}/api/admin/users/{user_id}/stats",
            headers=get_admin_auth_header()
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify user data
        assert data["id"] == user_id
        assert "name" in data
        assert "email" in data
        assert "role" in data
        print(f"✓ Got user stats for: {data['name']}")
        
        # Verify stats structure
        assert "stats" in data
        stats = data["stats"]
        assert "total" in stats
        assert "confirmed" in stats
        assert "declined" in stats
        assert "pending" in stats
        print(f"✓ Stats: total={stats['total']}, confirmed={stats['confirmed']}, declined={stats['declined']}, pending={stats['pending']}")
        
        # Verify recent_sessions structure
        assert "recent_sessions" in data
        recent = data["recent_sessions"]
        assert isinstance(recent, list)
        print(f"✓ Has {len(recent)} recent sessions")
        
        if recent:
            session = recent[0]
            assert "date" in session
            assert "status" in session
            assert "coach_name" in session
            print(f"✓ Recent session: {session['date']} - {session['status']}")

    def test_admin_get_user_stats_nonexistent_user(self):
        """Test GET /api/admin/users/{user_id}/stats returns 404 for non-existent user"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users/nonexistent-user-id/stats",
            headers=get_admin_auth_header()
        )
        assert response.status_code == 404
        print(f"✓ Non-existent user returns 404")

    def test_admin_get_trainer_stats(self):
        """Test GET /api/admin/users/{user_id}/stats works for trainers too"""
        users_resp = requests.get(f"{BASE_URL}/api/admin/users", headers=get_admin_auth_header())
        users = users_resp.json()
        
        trainer = next((u for u in users if u.get("role") == "trainer"), None)
        if not trainer:
            pytest.skip("No trainer user available")
        
        response = requests.get(
            f"{BASE_URL}/api/admin/users/{trainer['id']}/stats",
            headers=get_admin_auth_header()
        )
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == "trainer"
        assert "stats" in data
        print(f"✓ Got trainer stats: {data['name']}")


# ==================== EXISTING FEATURES STILL WORKING TESTS ====================

class TestExistingFeaturesStillWorking:
    """Verify existing features still work after new admin additions"""

    def test_homepage_loads(self):
        """Test homepage at / loads correctly"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "online"
        print(f"✓ Homepage API status: online")

    def test_public_trainers_endpoint(self):
        """Test public trainers endpoint still works"""
        response = requests.get(f"{BASE_URL}/api/trainers")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Public trainers endpoint works: {len(data)} trainers")

    def test_public_schedule_endpoint(self):
        """Test public schedule endpoint still works"""
        response = requests.get(f"{BASE_URL}/api/schedule")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Public schedule endpoint works: {len(data)} schedule items")

    def test_student_login_still_works(self):
        """Test student login still works"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            data={"username": TEST_STUDENT_EMAIL, "password": "test1234"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "student"
        print(f"✓ Student login works: {data['user']['name']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
