"""
Backend API Tests for Headlock Headquarter Wrestling School
Tests: Public endpoints, Admin authentication, CRUD operations
"""
import pytest
import requests
import os
from base64 import b64encode

# Get the base URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    BASE_URL = "https://gym-management-29.preview.emergentagent.com"

# Admin credentials
ADMIN_USER = "admin"
ADMIN_PASS = "headlock2024"

def get_auth_header():
    """Get Basic Auth header for admin requests"""
    credentials = f"{ADMIN_USER}:{ADMIN_PASS}"
    encoded = b64encode(credentials.encode()).decode()
    return {"Authorization": f"Basic {encoded}"}

# ==================== PUBLIC ENDPOINT TESTS ====================

class TestPublicEndpoints:
    """Tests for public API endpoints (no auth required)"""
    
    def test_root_endpoint(self):
        """Test API root returns status"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "online"
        assert "Headlock" in data["message"]
        print(f"✓ Root endpoint: {data}")
    
    def test_get_trainers(self):
        """Test public trainers endpoint"""
        response = requests.get(f"{BASE_URL}/api/trainers")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Trainers endpoint returned {len(data)} trainers")
    
    def test_get_schedule(self):
        """Test public schedule endpoint"""
        response = requests.get(f"{BASE_URL}/api/schedule")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Schedule endpoint returned {len(data)} items")
    
    def test_get_gallery(self):
        """Test public gallery endpoint"""
        response = requests.get(f"{BASE_URL}/api/gallery")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Gallery endpoint returned {len(data)} images")
    
    def test_get_instagram(self):
        """Test public Instagram feed endpoint"""
        response = requests.get(f"{BASE_URL}/api/instagram")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Instagram endpoint returned {len(data)} posts")
    
    def test_get_settings(self):
        """Test public settings endpoint"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert "address" in data
        assert "email" in data
        print(f"✓ Settings endpoint: {data.get('email')}")
    
    def test_get_pages(self):
        """Test public pages endpoint"""
        response = requests.get(f"{BASE_URL}/api/pages")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Pages endpoint returned {len(data)} pages")
    
    def test_get_homepage(self):
        """Test homepage sections endpoint"""
        response = requests.get(f"{BASE_URL}/api/homepage")
        assert response.status_code == 200
        data = response.json()
        assert "sections" in data
        print(f"✓ Homepage has {len(data['sections'])} sections")


# ==================== ADMIN AUTH TESTS ====================

class TestAdminAuth:
    """Tests for admin authentication"""
    
    def test_admin_verify_with_valid_credentials(self):
        """Test admin verification with correct credentials"""
        response = requests.get(f"{BASE_URL}/api/admin/verify", headers=get_auth_header())
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "authenticated"
        assert data["username"] == ADMIN_USER
        print(f"✓ Admin verification passed: {data}")
    
    def test_admin_verify_with_invalid_credentials(self):
        """Test admin verification with wrong credentials"""
        wrong_auth = {"Authorization": f"Basic {b64encode(b'wrong:wrong').decode()}"}
        response = requests.get(f"{BASE_URL}/api/admin/verify", headers=wrong_auth)
        assert response.status_code == 401
        print(f"✓ Invalid credentials correctly rejected")
    
    def test_admin_verify_without_credentials(self):
        """Test admin endpoint without auth header"""
        response = requests.get(f"{BASE_URL}/api/admin/verify")
        assert response.status_code == 401
        print(f"✓ No credentials correctly rejected")


# ==================== BOOKING TESTS ====================

class TestBookings:
    """Tests for booking submission and management"""
    
    def test_create_booking_success(self):
        """Test successful booking creation"""
        booking_data = {
            "first_name": "TEST_Max",
            "last_name": "Mustermann",
            "email": "test@example.com",
            "phone": "0123456789",
            "preferred_date": "2025-03-15",
            "experience_level": "beginner",
            "notes": "Test booking from API tests"
        }
        response = requests.post(f"{BASE_URL}/api/bookings", json=booking_data)
        assert response.status_code == 200
        data = response.json()
        assert data["first_name"] == booking_data["first_name"]
        assert data["email"] == booking_data["email"]
        assert "id" in data
        assert data["status"] == "pending"
        print(f"✓ Booking created: {data['id']}")
        return data["id"]
    
    def test_create_booking_invalid_email(self):
        """Test booking with invalid email"""
        booking_data = {
            "first_name": "Test",
            "last_name": "User",
            "email": "invalid-email",
            "phone": "0123456789",
            "preferred_date": "2025-03-15",
            "experience_level": "beginner"
        }
        response = requests.post(f"{BASE_URL}/api/bookings", json=booking_data)
        assert response.status_code == 422  # Validation error
        print(f"✓ Invalid email correctly rejected")
    
    def test_admin_get_bookings(self):
        """Test admin can retrieve all bookings"""
        response = requests.get(f"{BASE_URL}/api/admin/bookings", headers=get_auth_header())
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin retrieved {len(data)} bookings")


# ==================== CONTACT TESTS ====================

class TestContacts:
    """Tests for contact form submission"""
    
    def test_create_contact_success(self):
        """Test successful contact message submission"""
        contact_data = {
            "name": "TEST_Contact",
            "email": "contact@example.com",
            "phone": "0123456789",
            "message": "Test message from API tests"
        }
        response = requests.post(f"{BASE_URL}/api/contacts", json=contact_data)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == contact_data["name"]
        assert data["email"] == contact_data["email"]
        assert data["is_read"] == False
        assert "id" in data
        print(f"✓ Contact created: {data['id']}")
        return data["id"]
    
    def test_admin_get_contacts(self):
        """Test admin can retrieve all contacts"""
        response = requests.get(f"{BASE_URL}/api/admin/contacts", headers=get_auth_header())
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin retrieved {len(data)} contacts")


# ==================== TRAINER CRUD TESTS ====================

class TestTrainerCRUD:
    """Tests for trainer management (CRUD)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - store trainer ID for cleanup"""
        self.trainer_id = None
        yield
        # Cleanup - delete test trainer if created
        if self.trainer_id:
            requests.delete(f"{BASE_URL}/api/admin/trainers/{self.trainer_id}", headers=get_auth_header())
    
    def test_create_trainer(self):
        """Test creating a new trainer"""
        trainer_data = {
            "name": "TEST_Trainer",
            "title": "Test Coach",
            "bio_de": "Deutsche Biografie des Testtrainers",
            "bio_en": "English biography of test trainer",
            "image_url": "https://example.com/test-image.jpg",
            "years_experience": 10,
            "achievements": ["Test Achievement 1", "Test Achievement 2"]
        }
        response = requests.post(f"{BASE_URL}/api/admin/trainers", json=trainer_data, headers=get_auth_header())
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == trainer_data["name"]
        assert data["title"] == trainer_data["title"]
        assert "id" in data
        self.trainer_id = data["id"]
        print(f"✓ Trainer created: {data['id']}")
        
        # Verify trainer exists
        verify = requests.get(f"{BASE_URL}/api/trainers")
        trainers = verify.json()
        found = any(t["id"] == self.trainer_id for t in trainers)
        assert found, "Created trainer should be in public list"
        print(f"✓ Trainer verified in public list")
    
    def test_update_trainer(self):
        """Test updating a trainer"""
        # First create a trainer
        trainer_data = {
            "name": "TEST_UpdateTrainer",
            "title": "Original Title",
            "bio_de": "Original Bio DE",
            "bio_en": "Original Bio EN",
            "image_url": "https://example.com/test.jpg",
            "years_experience": 5,
            "achievements": []
        }
        create_resp = requests.post(f"{BASE_URL}/api/admin/trainers", json=trainer_data, headers=get_auth_header())
        assert create_resp.status_code == 200
        self.trainer_id = create_resp.json()["id"]
        
        # Update the trainer
        updated_data = {
            "name": "TEST_UpdateTrainer",
            "title": "Updated Title",
            "bio_de": "Updated Bio DE",
            "bio_en": "Updated Bio EN",
            "image_url": "https://example.com/updated.jpg",
            "years_experience": 6,
            "achievements": ["New Achievement"]
        }
        update_resp = requests.put(f"{BASE_URL}/api/admin/trainers/{self.trainer_id}", json=updated_data, headers=get_auth_header())
        assert update_resp.status_code == 200
        data = update_resp.json()
        assert data["title"] == "Updated Title"
        assert data["years_experience"] == 6
        print(f"✓ Trainer updated successfully")
    
    def test_delete_trainer(self):
        """Test deleting a trainer"""
        # First create a trainer
        trainer_data = {
            "name": "TEST_DeleteTrainer",
            "title": "To Delete",
            "bio_de": "To be deleted",
            "bio_en": "To be deleted",
            "image_url": "https://example.com/delete.jpg",
            "years_experience": 1,
            "achievements": []
        }
        create_resp = requests.post(f"{BASE_URL}/api/admin/trainers", json=trainer_data, headers=get_auth_header())
        trainer_id = create_resp.json()["id"]
        
        # Delete the trainer
        delete_resp = requests.delete(f"{BASE_URL}/api/admin/trainers/{trainer_id}", headers=get_auth_header())
        assert delete_resp.status_code == 200
        assert delete_resp.json()["status"] == "deleted"
        
        # Verify trainer is removed
        trainers = requests.get(f"{BASE_URL}/api/trainers").json()
        found = any(t["id"] == trainer_id for t in trainers)
        assert not found, "Deleted trainer should not be in list"
        print(f"✓ Trainer deleted successfully")


# ==================== GALLERY CRUD TESTS ====================

class TestGalleryCRUD:
    """Tests for gallery image management"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - store image ID for cleanup"""
        self.image_id = None
        yield
        if self.image_id:
            requests.delete(f"{BASE_URL}/api/admin/gallery/{self.image_id}", headers=get_auth_header())
    
    def test_create_gallery_image(self):
        """Test creating a new gallery image"""
        image_data = {
            "url": "https://example.com/test-gallery.jpg",
            "title": "TEST_Gallery_Image",
            "description": "Test gallery image",
            "category": "training",
            "is_active": True,
            "order": 99
        }
        response = requests.post(f"{BASE_URL}/api/admin/gallery", json=image_data, headers=get_auth_header())
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == image_data["title"]
        assert "id" in data
        self.image_id = data["id"]
        print(f"✓ Gallery image created: {data['id']}")
    
    def test_update_gallery_image(self):
        """Test updating a gallery image"""
        # Create image
        image_data = {
            "url": "https://example.com/original.jpg",
            "title": "TEST_Update_Image",
            "category": "training",
            "is_active": True,
            "order": 0
        }
        create_resp = requests.post(f"{BASE_URL}/api/admin/gallery", json=image_data, headers=get_auth_header())
        self.image_id = create_resp.json()["id"]
        
        # Update image
        updated_data = {
            "url": "https://example.com/updated.jpg",
            "title": "TEST_Updated_Image",
            "category": "event",
            "is_active": True,
            "order": 1
        }
        update_resp = requests.put(f"{BASE_URL}/api/admin/gallery/{self.image_id}", json=updated_data, headers=get_auth_header())
        assert update_resp.status_code == 200
        data = update_resp.json()
        assert data["title"] == "TEST_Updated_Image"
        assert data["category"] == "event"
        print(f"✓ Gallery image updated successfully")
    
    def test_delete_gallery_image(self):
        """Test deleting a gallery image"""
        # Create image
        image_data = {
            "url": "https://example.com/delete.jpg",
            "title": "TEST_Delete_Image",
            "category": "training",
            "is_active": True,
            "order": 0
        }
        create_resp = requests.post(f"{BASE_URL}/api/admin/gallery", json=image_data, headers=get_auth_header())
        image_id = create_resp.json()["id"]
        
        # Delete image
        delete_resp = requests.delete(f"{BASE_URL}/api/admin/gallery/{image_id}", headers=get_auth_header())
        assert delete_resp.status_code == 200
        print(f"✓ Gallery image deleted successfully")


# ==================== SCHEDULE CRUD TESTS ====================

class TestScheduleCRUD:
    """Tests for schedule management - Full CRUD (NEW FEATURE)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - store schedule ID for cleanup"""
        self.schedule_id = None
        yield
        # Cleanup - delete test schedule item if created
        if self.schedule_id:
            requests.delete(f"{BASE_URL}/api/admin/schedule/{self.schedule_id}", headers=get_auth_header())
    
    def test_create_schedule_item(self):
        """Test creating a new schedule entry"""
        schedule_data = {
            "day_de": "Mittwoch",
            "day_en": "Wednesday",
            "time_start": "18:00",
            "time_end": "20:00",
            "title_de": "TEST_Abendtraining",
            "title_en": "TEST_Evening Training",
            "description_de": "Abendtraining für Fortgeschrittene",
            "description_en": "Evening training for advanced students",
            "is_active": True
        }
        response = requests.post(f"{BASE_URL}/api/admin/schedule", json=schedule_data, headers=get_auth_header())
        assert response.status_code == 200
        data = response.json()
        assert data["day_de"] == schedule_data["day_de"]
        assert data["day_en"] == schedule_data["day_en"]
        assert data["time_start"] == schedule_data["time_start"]
        assert data["time_end"] == schedule_data["time_end"]
        assert data["title_de"] == schedule_data["title_de"]
        assert data["title_en"] == schedule_data["title_en"]
        assert "id" in data
        self.schedule_id = data["id"]
        print(f"✓ Schedule item created: {data['id']}")
        
        # Verify schedule item appears in admin list
        admin_response = requests.get(f"{BASE_URL}/api/admin/schedule", headers=get_auth_header())
        schedule_items = admin_response.json()
        found = any(s["id"] == self.schedule_id for s in schedule_items)
        assert found, "Created schedule item should be in admin list"
        print(f"✓ Schedule item verified in admin list")
        
        # Verify active schedule item appears in public list
        public_response = requests.get(f"{BASE_URL}/api/schedule")
        public_items = public_response.json()
        found_public = any(s["id"] == self.schedule_id for s in public_items)
        assert found_public, "Active schedule item should be in public list"
        print(f"✓ Active schedule item verified in public list")
    
    def test_create_inactive_schedule_item(self):
        """Test creating an inactive schedule entry - should not appear in public list"""
        schedule_data = {
            "day_de": "Freitag",
            "day_en": "Friday",
            "time_start": "10:00",
            "time_end": "12:00",
            "title_de": "TEST_Inactive Training",
            "title_en": "TEST_Inactive Training",
            "description_de": "Inaktives Training",
            "description_en": "Inactive training",
            "is_active": False
        }
        response = requests.post(f"{BASE_URL}/api/admin/schedule", json=schedule_data, headers=get_auth_header())
        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] == False
        self.schedule_id = data["id"]
        print(f"✓ Inactive schedule item created: {data['id']}")
        
        # Verify inactive item is in admin list but NOT in public list
        admin_response = requests.get(f"{BASE_URL}/api/admin/schedule", headers=get_auth_header())
        schedule_items = admin_response.json()
        found_admin = any(s["id"] == self.schedule_id for s in schedule_items)
        assert found_admin, "Inactive item should be in admin list"
        
        public_response = requests.get(f"{BASE_URL}/api/schedule")
        public_items = public_response.json()
        found_public = any(s["id"] == self.schedule_id for s in public_items)
        assert not found_public, "Inactive schedule item should NOT be in public list"
        print(f"✓ Inactive schedule item correctly hidden from public")
    
    def test_update_schedule_item(self):
        """Test updating a schedule entry"""
        # Create initial schedule item
        initial_data = {
            "day_de": "Montag",
            "day_en": "Monday",
            "time_start": "08:00",
            "time_end": "10:00",
            "title_de": "TEST_Original",
            "title_en": "TEST_Original",
            "description_de": "Original description",
            "description_en": "Original description",
            "is_active": True
        }
        create_resp = requests.post(f"{BASE_URL}/api/admin/schedule", json=initial_data, headers=get_auth_header())
        assert create_resp.status_code == 200
        self.schedule_id = create_resp.json()["id"]
        
        # Update the schedule item
        updated_data = {
            "day_de": "Dienstag",
            "day_en": "Tuesday",
            "time_start": "14:00",
            "time_end": "16:00",
            "title_de": "TEST_Updated Title",
            "title_en": "TEST_Updated Title EN",
            "description_de": "Updated description DE",
            "description_en": "Updated description EN",
            "is_active": True
        }
        update_resp = requests.put(f"{BASE_URL}/api/admin/schedule/{self.schedule_id}", json=updated_data, headers=get_auth_header())
        assert update_resp.status_code == 200
        data = update_resp.json()
        assert data["day_de"] == "Dienstag"
        assert data["day_en"] == "Tuesday"
        assert data["time_start"] == "14:00"
        assert data["time_end"] == "16:00"
        assert data["title_de"] == "TEST_Updated Title"
        print(f"✓ Schedule item updated successfully")
        
        # Verify update persisted via GET
        admin_response = requests.get(f"{BASE_URL}/api/admin/schedule", headers=get_auth_header())
        schedule_items = admin_response.json()
        updated_item = next((s for s in schedule_items if s["id"] == self.schedule_id), None)
        assert updated_item is not None
        assert updated_item["day_de"] == "Dienstag"
        assert updated_item["time_start"] == "14:00"
        print(f"✓ Schedule update verified via GET")
    
    def test_delete_schedule_item(self):
        """Test deleting a schedule entry"""
        # Create schedule item to delete
        schedule_data = {
            "day_de": "Donnerstag",
            "day_en": "Thursday",
            "time_start": "19:00",
            "time_end": "21:00",
            "title_de": "TEST_Delete Me",
            "title_en": "TEST_Delete Me",
            "description_de": "To be deleted",
            "description_en": "To be deleted",
            "is_active": True
        }
        create_resp = requests.post(f"{BASE_URL}/api/admin/schedule", json=schedule_data, headers=get_auth_header())
        schedule_id = create_resp.json()["id"]
        
        # Delete the schedule item
        delete_resp = requests.delete(f"{BASE_URL}/api/admin/schedule/{schedule_id}", headers=get_auth_header())
        assert delete_resp.status_code == 200
        assert delete_resp.json()["status"] == "deleted"
        print(f"✓ Schedule item deleted")
        
        # Verify item is removed from admin list
        admin_response = requests.get(f"{BASE_URL}/api/admin/schedule", headers=get_auth_header())
        schedule_items = admin_response.json()
        found = any(s["id"] == schedule_id for s in schedule_items)
        assert not found, "Deleted schedule item should not be in list"
        print(f"✓ Deleted schedule item verified removed from list")
    
    def test_delete_nonexistent_schedule_item(self):
        """Test deleting a schedule item that doesn't exist"""
        delete_resp = requests.delete(f"{BASE_URL}/api/admin/schedule/nonexistent-id-12345", headers=get_auth_header())
        assert delete_resp.status_code == 404
        print(f"✓ Delete nonexistent item correctly returns 404")
    
    def test_update_nonexistent_schedule_item(self):
        """Test updating a schedule item that doesn't exist"""
        update_data = {
            "day_de": "Samstag",
            "day_en": "Saturday",
            "time_start": "12:00",
            "time_end": "14:00",
            "title_de": "Test",
            "title_en": "Test",
            "is_active": True
        }
        update_resp = requests.put(f"{BASE_URL}/api/admin/schedule/nonexistent-id-12345", json=update_data, headers=get_auth_header())
        assert update_resp.status_code == 404
        print(f"✓ Update nonexistent item correctly returns 404")
    
    def test_admin_get_schedule(self):
        """Test admin can retrieve all schedule items including inactive"""
        response = requests.get(f"{BASE_URL}/api/admin/schedule", headers=get_auth_header())
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin retrieved {len(data)} schedule items")


# ==================== CMS PAGES TESTS ====================

class TestCMSPages:
    """Tests for CMS page management"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - store page ID for cleanup"""
        self.page_id = None
        yield
        if self.page_id:
            requests.delete(f"{BASE_URL}/api/admin/pages/{self.page_id}", headers=get_auth_header())
    
    def test_create_page(self):
        """Test creating a new CMS page"""
        page_data = {
            "slug": "test-page-api",
            "title_de": "Test Seite",
            "title_en": "Test Page",
            "meta_description_de": "Test Beschreibung",
            "meta_description_en": "Test description",
            "is_published": True,
            "show_in_nav": False,
            "nav_order": 99,
            "template": "default"
        }
        response = requests.post(f"{BASE_URL}/api/admin/pages", json=page_data, headers=get_auth_header())
        assert response.status_code == 200
        data = response.json()
        assert data["slug"] == page_data["slug"]
        assert data["title_de"] == page_data["title_de"]
        assert "id" in data
        self.page_id = data["id"]
        print(f"✓ CMS page created: {data['id']}")
    
    def test_duplicate_slug_rejected(self):
        """Test that duplicate page slugs are rejected"""
        page_data = {
            "slug": "test-duplicate-slug",
            "title_de": "Test 1",
            "title_en": "Test 1",
            "is_published": True,
            "show_in_nav": False,
            "nav_order": 0,
            "template": "default"
        }
        # Create first page
        resp1 = requests.post(f"{BASE_URL}/api/admin/pages", json=page_data, headers=get_auth_header())
        assert resp1.status_code == 200
        self.page_id = resp1.json()["id"]
        
        # Try to create duplicate
        resp2 = requests.post(f"{BASE_URL}/api/admin/pages", json=page_data, headers=get_auth_header())
        assert resp2.status_code == 400
        print(f"✓ Duplicate slug correctly rejected")


# ==================== SEED DATA TEST ====================

class TestSeedData:
    """Test seed data functionality"""
    
    def test_seed_data_endpoint(self):
        """Test admin can seed initial data"""
        response = requests.post(f"{BASE_URL}/api/admin/seed", json={}, headers=get_auth_header())
        assert response.status_code == 200
        data = response.json()
        assert data["status"] in ["seeded", "already_seeded"]
        print(f"✓ Seed data: {data['status']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
