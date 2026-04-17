"""
Events & Tickets Feature Tests
Tests for the new events page, ticket reservation, and admin management features
"""
import pytest
import requests
import os
import base64

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_USER = "admin"
ADMIN_PASS = "headlock2024"
SCANNER_EMAIL = "scanner@test.de"
SCANNER_PASS = "test1234"

# Test event IDs
FUTURE_EVENT_ID = "23d1e151-7703-49a0-80cf-455b3888dadc"  # Summer Slam (future)
PAST_EVENT_ID = "dab9134a-2639-496c-995c-d0270bc23afd"    # Wrestling Night (past)


@pytest.fixture
def admin_headers():
    """Basic auth headers for admin endpoints"""
    credentials = base64.b64encode(f"{ADMIN_USER}:{ADMIN_PASS}".encode()).decode()
    return {"Authorization": f"Basic {credentials}"}


@pytest.fixture
def scanner_token():
    """Get JWT token for ticket scanner user"""
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        data={"username": SCANNER_EMAIL, "password": SCANNER_PASS}
    )
    if response.status_code == 200:
        return response.json().get("access_token")
    pytest.skip("Scanner login failed")


@pytest.fixture
def scanner_headers(scanner_token):
    """JWT headers for scanner endpoints"""
    return {"Authorization": f"Bearer {scanner_token}"}


class TestPublicEventsAPI:
    """Public events endpoints - no auth required"""
    
    def test_get_events_returns_published_events(self):
        """GET /api/events returns list of published events"""
        response = requests.get(f"{BASE_URL}/api/events")
        assert response.status_code == 200
        
        events = response.json()
        assert isinstance(events, list)
        assert len(events) >= 1
        
        # Verify event structure
        event = events[0]
        assert "id" in event
        assert "title_de" in event
        assert "date" in event
        assert "ticket_price" in event
        assert "tickets_remaining" in event or event.get("ticket_quota", 0) == 0
        print(f"✓ GET /api/events returned {len(events)} events")
    
    def test_get_featured_event_returns_future_event(self):
        """GET /api/events/featured returns next upcoming event"""
        response = requests.get(f"{BASE_URL}/api/events/featured")
        assert response.status_code == 200
        
        event = response.json()
        if event:  # May be null if no future events
            assert "id" in event
            assert "title_de" in event
            assert "date" in event
            # Featured event should be in the future
            assert event["date"] >= "2026-04-17"  # Today's date
            print(f"✓ Featured event: {event['title_de']} on {event['date']}")
        else:
            print("✓ No featured event (no future events)")
    
    def test_get_event_by_id(self):
        """GET /api/events/{id} returns specific event"""
        response = requests.get(f"{BASE_URL}/api/events/{FUTURE_EVENT_ID}")
        assert response.status_code == 200
        
        event = response.json()
        assert event["id"] == FUTURE_EVENT_ID
        assert "title_de" in event
        assert "description_de" in event
        assert "ticket_price" in event
        assert "tickets_remaining" in event or event.get("ticket_quota", 0) == 0
        print(f"✓ Event detail: {event['title_de']}")
    
    def test_get_event_not_found(self):
        """GET /api/events/{id} returns 404 for invalid ID"""
        response = requests.get(f"{BASE_URL}/api/events/invalid-id-12345")
        assert response.status_code == 404
        print("✓ Invalid event ID returns 404")


class TestPaymentInfo:
    """Public payment info endpoint"""
    
    def test_get_payment_info(self):
        """GET /api/payment-info returns bank transfer details"""
        response = requests.get(f"{BASE_URL}/api/payment-info")
        assert response.status_code == 200
        
        info = response.json()
        assert "bank_name" in info
        assert "account_holder" in info
        assert "iban" in info
        assert "bic" in info
        assert "reference_prefix" in info
        print(f"✓ Payment info: {info['bank_name']} - {info['iban'][:10]}...")


class TestTicketReservation:
    """Ticket reservation endpoints"""
    
    def test_reserve_ticket_box_office(self):
        """POST /api/tickets/reserve creates ticket with box_office payment"""
        payload = {
            "event_id": FUTURE_EVENT_ID,
            "customer_name": "TEST_BoxOffice User",
            "customer_email": "test_boxoffice@example.com",
            "customer_phone": "0123456789",
            "quantity": 1,
            "payment_method": "box_office"
        }
        response = requests.post(f"{BASE_URL}/api/tickets/reserve", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert "tickets" in data
        assert "event" in data
        assert len(data["tickets"]) == 1
        
        ticket = data["tickets"][0]
        assert ticket["customer_name"] == "TEST_BoxOffice User"
        assert ticket["payment_method"] == "box_office"
        assert ticket["ticket_code"].startswith("HQ-")
        assert ticket["is_checked_in"] == False
        print(f"✓ Reserved ticket: {ticket['ticket_code']}")
    
    def test_reserve_ticket_transfer(self):
        """POST /api/tickets/reserve creates ticket with transfer payment"""
        payload = {
            "event_id": FUTURE_EVENT_ID,
            "customer_name": "TEST_Transfer User",
            "customer_email": "test_transfer@example.com",
            "customer_phone": "0987654321",
            "quantity": 2,
            "payment_method": "transfer"
        }
        response = requests.post(f"{BASE_URL}/api/tickets/reserve", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["tickets"]) == 2  # Quantity = 2
        
        for ticket in data["tickets"]:
            assert ticket["payment_method"] == "transfer"
            assert ticket["price"] == data["event"]["ticket_price"]
        print(f"✓ Reserved {len(data['tickets'])} tickets with transfer payment")
    
    def test_reserve_ticket_invalid_event(self):
        """POST /api/tickets/reserve returns 404 for invalid event"""
        payload = {
            "event_id": "invalid-event-id",
            "customer_name": "Test",
            "customer_email": "test@test.com",
            "quantity": 1,
            "payment_method": "box_office"
        }
        response = requests.post(f"{BASE_URL}/api/tickets/reserve", json=payload)
        assert response.status_code == 404
        print("✓ Invalid event returns 404")


class TestTicketPDF:
    """Ticket PDF download"""
    
    def test_download_ticket_pdf(self, admin_headers):
        """GET /api/tickets/{id}/pdf returns valid PDF"""
        # First get a ticket ID
        response = requests.get(
            f"{BASE_URL}/api/admin/events/{FUTURE_EVENT_ID}/tickets",
            headers=admin_headers
        )
        assert response.status_code == 200
        tickets = response.json()
        
        if len(tickets) > 0:
            ticket_id = tickets[0]["id"]
            pdf_response = requests.get(f"{BASE_URL}/api/tickets/{ticket_id}/pdf")
            assert pdf_response.status_code == 200
            assert pdf_response.headers.get("content-type") == "application/pdf"
            assert "attachment" in pdf_response.headers.get("content-disposition", "")
            print(f"✓ PDF download works for ticket {ticket_id[:8]}...")
        else:
            pytest.skip("No tickets to test PDF download")


class TestTicketValidation:
    """Ticket validation/check-in endpoints"""
    
    def test_validate_ticket_requires_auth(self):
        """POST /api/tickets/validate/{code} requires scanner auth"""
        response = requests.post(f"{BASE_URL}/api/tickets/validate/HQ-TEST123")
        assert response.status_code == 401
        print("✓ Ticket validation requires authentication")
    
    def test_validate_already_checked_in_ticket(self, scanner_headers):
        """POST /api/tickets/validate/{code} returns already checked in message"""
        # HQ-D55861A1 is already checked in per test data
        response = requests.post(
            f"{BASE_URL}/api/tickets/validate/HQ-D55861A1",
            headers=scanner_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["valid"] == False
        assert "Bereits eingecheckt" in data["message"]
        print("✓ Already checked-in ticket returns correct message")
    
    def test_validate_invalid_ticket_code(self, scanner_headers):
        """POST /api/tickets/validate/{code} returns not found for invalid code"""
        response = requests.post(
            f"{BASE_URL}/api/tickets/validate/HQ-INVALID123",
            headers=scanner_headers
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["valid"] == False
        assert "nicht gefunden" in data["message"]
        print("✓ Invalid ticket code returns not found message")


class TestAdminEventsAPI:
    """Admin events management endpoints"""
    
    def test_admin_get_events(self, admin_headers):
        """GET /api/admin/events returns all events with ticket counts"""
        response = requests.get(f"{BASE_URL}/api/admin/events", headers=admin_headers)
        assert response.status_code == 200
        
        events = response.json()
        assert isinstance(events, list)
        
        for event in events:
            assert "tickets_sold" in event
            assert isinstance(event["tickets_sold"], int)
        print(f"✓ Admin events list: {len(events)} events")
    
    def test_admin_get_event_tickets(self, admin_headers):
        """GET /api/admin/events/{id}/tickets returns ticket list"""
        response = requests.get(
            f"{BASE_URL}/api/admin/events/{FUTURE_EVENT_ID}/tickets",
            headers=admin_headers
        )
        assert response.status_code == 200
        
        tickets = response.json()
        assert isinstance(tickets, list)
        
        for ticket in tickets:
            assert "ticket_code" in ticket
            assert "customer_name" in ticket
            assert "customer_email" in ticket
            assert "payment_method" in ticket
            assert "is_checked_in" in ticket
        print(f"✓ Event tickets: {len(tickets)} tickets")
    
    def test_admin_create_event(self, admin_headers):
        """POST /api/admin/events creates new event"""
        payload = {
            "title_de": "TEST_Event",
            "title_en": "TEST_Event EN",
            "description_de": "Test description",
            "date": "2026-12-31",
            "time": "20:00",
            "location": "Test Location",
            "ticket_price": 25.0,
            "ticket_quota": 100,
            "is_published": False
        }
        response = requests.post(
            f"{BASE_URL}/api/admin/events",
            json=payload,
            headers=admin_headers
        )
        assert response.status_code == 200
        
        event = response.json()
        assert event["title_de"] == "TEST_Event"
        assert event["ticket_price"] == 25.0
        assert "id" in event
        print(f"✓ Created event: {event['id'][:8]}...")
        
        # Cleanup - delete the test event
        requests.delete(f"{BASE_URL}/api/admin/events/{event['id']}", headers=admin_headers)
    
    def test_admin_requires_auth(self):
        """Admin endpoints require authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/events")
        assert response.status_code == 401
        print("✓ Admin endpoints require authentication")


class TestAdminPaymentSettings:
    """Admin payment settings endpoints"""
    
    def test_admin_get_payment_settings(self, admin_headers):
        """GET /api/admin/payment-settings returns settings"""
        response = requests.get(
            f"{BASE_URL}/api/admin/payment-settings",
            headers=admin_headers
        )
        assert response.status_code == 200
        
        settings = response.json()
        assert "bank_name" in settings
        assert "iban" in settings
        assert "reference_prefix" in settings
        print(f"✓ Payment settings: {settings['bank_name']}")
    
    def test_admin_update_payment_settings(self, admin_headers):
        """PUT /api/admin/payment-settings updates settings"""
        # Get current settings first
        current = requests.get(
            f"{BASE_URL}/api/admin/payment-settings",
            headers=admin_headers
        ).json()
        
        # Update with test value
        payload = {"additional_info_en": "TEST_Updated info"}
        response = requests.put(
            f"{BASE_URL}/api/admin/payment-settings",
            json=payload,
            headers=admin_headers
        )
        assert response.status_code == 200
        
        updated = response.json()
        assert updated["additional_info_en"] == "TEST_Updated info"
        print("✓ Payment settings updated")
        
        # Restore original
        requests.put(
            f"{BASE_URL}/api/admin/payment-settings",
            json={"additional_info_en": current.get("additional_info_en", "")},
            headers=admin_headers
        )


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
