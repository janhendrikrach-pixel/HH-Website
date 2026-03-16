import requests
import sys
import base64
from datetime import datetime

class WrestlingSchoolAPITester:
    def __init__(self, base_url="https://gym-management-29.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.admin_username = "admin"
        self.admin_password = "headlock2024"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def get_auth_header(self):
        """Get Basic Auth header for admin endpoints"""
        credentials = f"{self.admin_username}:{self.admin_password}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        return {'Authorization': f'Basic {encoded_credentials}'}

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, auth_required=False):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if auth_required:
            test_headers.update(self.get_auth_header())

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json() if response.content else {}
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    'name': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'name': name,
                'error': str(e)
            })
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_admin_auth(self):
        """Test admin authentication"""
        return self.run_test("Admin Auth", "GET", "admin/verify", 200, auth_required=True)

    def test_public_endpoints(self):
        """Test all public endpoints"""
        endpoints = [
            ("Get Trainers", "GET", "trainers", 200),
            ("Get Schedule", "GET", "schedule", 200),
            ("Get Gallery", "GET", "gallery", 200),
            ("Get Settings", "GET", "settings", 200)
        ]
        
        results = []
        for name, method, endpoint, expected in endpoints:
            success, data = self.run_test(name, method, endpoint, expected)
            results.append((success, data))
        
        return results

    def test_booking_submission(self):
        """Test booking form submission"""
        booking_data = {
            "first_name": "Test",
            "last_name": "User",
            "email": "test@example.com",
            "phone": "01234567890",
            "preferred_date": "2024-12-25",
            "experience_level": "beginner",
            "notes": "Test booking"
        }
        return self.run_test("Create Booking", "POST", "bookings", 200, data=booking_data)

    def test_contact_submission(self):
        """Test contact form submission"""
        contact_data = {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "01234567890",
            "message": "Test contact message"
        }
        return self.run_test("Create Contact", "POST", "contacts", 200, data=contact_data)

    def test_admin_endpoints(self):
        """Test admin endpoints"""
        endpoints = [
            ("Admin Get Trainers", "GET", "admin/trainers", 200),
            ("Admin Get Schedule", "GET", "admin/schedule", 200),
            ("Admin Get Gallery", "GET", "admin/gallery", 200),
            ("Admin Get Bookings", "GET", "admin/bookings", 200),
            ("Admin Get Contacts", "GET", "admin/contacts", 200)
        ]
        
        results = []
        for name, method, endpoint, expected in endpoints:
            success, data = self.run_test(name, method, endpoint, expected, auth_required=True)
            results.append((success, data))
        
        return results

    def test_seed_data(self):
        """Test seeding initial data"""
        return self.run_test("Seed Data", "POST", "admin/seed", 200, auth_required=True)

    def test_gallery_management(self):
        """Test gallery CRUD operations"""
        # First create a gallery image
        image_data = {
            "url": "https://example.com/test-image.jpg",
            "title": "Test Image",
            "category": "training",
            "order": 1
        }
        
        success, created_image = self.run_test("Create Gallery Image", "POST", "admin/gallery", 200, 
                                             data=image_data, auth_required=True)
        
        if success and created_image.get('id'):
            # Test delete
            image_id = created_image['id']
            self.run_test("Delete Gallery Image", "DELETE", f"admin/gallery/{image_id}", 200, 
                         auth_required=True)
        
        return success

def main():
    print("🏋️ Starting Wrestling School API Tests")
    print("=" * 50)
    
    tester = WrestlingSchoolAPITester()
    
    # Test API availability
    print("\n📡 Testing API Availability...")
    tester.test_root_endpoint()
    
    # Test admin authentication
    print("\n🔐 Testing Admin Authentication...")
    tester.test_admin_auth()
    
    # Test public endpoints
    print("\n🌐 Testing Public Endpoints...")
    tester.test_public_endpoints()
    
    # Test form submissions
    print("\n📝 Testing Form Submissions...")
    tester.test_booking_submission()
    tester.test_contact_submission()
    
    # Test admin endpoints
    print("\n👨‍💼 Testing Admin Endpoints...")
    tester.test_admin_endpoints()
    
    # Test seed data
    print("\n🌱 Testing Seed Data...")
    tester.test_seed_data()
    
    # Test gallery management
    print("\n🖼️ Testing Gallery Management...")
    tester.test_gallery_management()
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.failed_tests:
        print("\n❌ Failed Tests:")
        for test in tester.failed_tests:
            error_msg = test.get('error', f"Expected {test.get('expected')}, got {test.get('actual')}")
            print(f"   - {test['name']}: {error_msg}")
    
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    print(f"\n📈 Success Rate: {success_rate:.1f}%")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())