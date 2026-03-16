from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Query
from fastapi.security import HTTPBasic, HTTPBasicCredentials, OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import secrets
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
from jose import jwt, JWTError
import resend

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create uploads directory
UPLOADS_DIR = ROOT_DIR / 'uploads'
UPLOADS_DIR.mkdir(exist_ok=True)
(UPLOADS_DIR / 'gallery').mkdir(exist_ok=True)
(UPLOADS_DIR / 'trainers').mkdir(exist_ok=True)
(UPLOADS_DIR / 'instagram').mkdir(exist_ok=True)
(UPLOADS_DIR / 'pages').mkdir(exist_ok=True)
(UPLOADS_DIR / 'profiles').mkdir(exist_ok=True)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="Headlock Headquarter API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security - Admin Basic Auth
security = HTTPBasic()

ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'headlock2024')

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', secrets.token_hex(32))
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

# Resend Email Config
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

def verify_admin(credentials: HTTPBasicCredentials = Depends(security)):
    correct_username = secrets.compare_digest(credentials.username, ADMIN_USERNAME)
    correct_password = secrets.compare_digest(credentials.password, ADMIN_PASSWORD)
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_access_token(data: dict) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS)
    return jwt.encode({**data, "exp": expire}, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": user_id, "is_active": True}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def require_role(user: dict, roles: list):
    if user["role"] not in roles:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

async def send_email(to: str, subject: str, html: str):
    if not RESEND_API_KEY:
        logging.info(f"Email (no API key): To={to}, Subject={subject}")
        return None
    try:
        result = await asyncio.to_thread(resend.Emails.send, {
            "from": SENDER_EMAIL, "to": [to], "subject": subject, "html": html
        })
        logging.info(f"Email sent to {to}: {result}")
        return result
    except Exception as e:
        logging.error(f"Email failed to {to}: {e}")
        return None

# ========== MODELS ==========

class TrainerBase(BaseModel):
    name: str
    title: str
    bio_de: str
    bio_en: str
    image_url: str
    years_experience: int
    achievements: List[str] = []

class Trainer(TrainerBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ScheduleItemBase(BaseModel):
    day_de: str
    day_en: str
    time_start: str
    time_end: str
    title_de: str
    title_en: str
    description_de: str = ""
    description_en: str = ""
    is_active: bool = True

class ScheduleItem(ScheduleItemBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class GalleryImageBase(BaseModel):
    url: str
    title: str = ""
    description: str = ""
    category: str = "training"
    is_active: bool = True
    order: int = 0

class GalleryImage(GalleryImageBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class InstagramPostBase(BaseModel):
    post_url: str
    thumbnail_url: str = ""
    caption: str = ""
    post_type: str = "image"
    is_story: bool = False
    story_expires_at: Optional[str] = None
    is_active: bool = True
    order: int = 0
    embed_code: str = ""

class InstagramPost(InstagramPostBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class BookingBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    preferred_date: str
    experience_level: str
    notes: str = ""

class Booking(BookingBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "pending"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ContactMessageBase(BaseModel):
    name: str
    email: EmailStr
    phone: str = ""
    message: str

class ContactMessage(ContactMessageBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    is_read: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class SiteSettingsBase(BaseModel):
    address: str = "Max-Müller-Straße 1, 30179 Hannover"
    phone: str = "01523 3552397"
    email: str = "info@wrestling.schule"
    opening_hours_de: str = "Samstags 12:00 - 16:00 Uhr"
    opening_hours_en: str = "Saturdays 12:00 - 16:00"
    instagram_url: str = ""
    facebook_url: str = ""

class SiteSettings(SiteSettingsBase):
    model_config = ConfigDict(extra="ignore")
    id: str = "site_settings"

# ========== CMS MODELS ==========

class PageSectionBase(BaseModel):
    section_type: str  # hero, about, trainers, schedule, gallery, instagram, reviews, contact, custom, text, cta
    title_de: str = ""
    title_en: str = ""
    subtitle_de: str = ""
    subtitle_en: str = ""
    content_de: str = ""
    content_en: str = ""
    background_image: str = ""
    background_color: str = ""
    is_active: bool = True
    order: int = 0
    settings: dict = {}

class PageSection(PageSectionBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    page_id: str = "home"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class PageBase(BaseModel):
    slug: str
    title_de: str
    title_en: str
    meta_description_de: str = ""
    meta_description_en: str = ""
    is_published: bool = True
    show_in_nav: bool = True
    nav_order: int = 0
    template: str = "default"

class Page(PageBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ========== USER & TRAINING MODELS ==========

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "student"  # student, trainer
    phone: str = ""

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    image_url: Optional[str] = None
    experience_level: Optional[str] = None
    emergency_contact: Optional[str] = None
    weight_class: Optional[str] = None

class UserOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: str
    role: str
    phone: str = ""
    bio: str = ""
    image_url: str = ""
    experience_level: str = ""
    emergency_contact: str = ""
    weight_class: str = ""
    is_active: bool = True
    created_at: str = ""

class TrainingSessionBase(BaseModel):
    schedule_id: str
    date: str  # YYYY-MM-DD
    coach_id: str = ""
    coach_name: str = ""
    notes_de: str = ""
    notes_en: str = ""
    max_participants: int = 30
    is_cancelled: bool = False

class TrainingSession(TrainingSessionBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_by: str = ""
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AttendanceUpdate(BaseModel):
    status: str  # confirmed, declined

class Attendance(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    user_id: str
    user_name: str = ""
    status: str = "pending"  # pending, confirmed, declined
    responded_at: Optional[str] = None

class NotificationOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    type: str = "reminder"
    message_de: str = ""
    message_en: str = ""
    is_read: bool = False
    created_at: str = ""

# ========== PUBLIC ENDPOINTS ==========

@api_router.get("/")
async def root():
    return {"message": "Headlock Headquarter API", "status": "online"}

@api_router.get("/trainers", response_model=List[Trainer])
async def get_trainers():
    trainers = await db.trainers.find({}, {"_id": 0}).to_list(100)
    return trainers

@api_router.get("/schedule", response_model=List[ScheduleItem])
async def get_schedule():
    items = await db.schedule.find({"is_active": True}, {"_id": 0}).to_list(100)
    return items

@api_router.get("/gallery", response_model=List[GalleryImage])
async def get_gallery():
    images = await db.gallery.find({"is_active": True}, {"_id": 0}).sort("order", 1).to_list(100)
    return images

@api_router.get("/instagram", response_model=List[InstagramPost])
async def get_instagram_posts():
    posts = await db.instagram.find({"is_active": True}, {"_id": 0}).sort("order", 1).to_list(50)
    return posts

@api_router.get("/instagram/stories")
async def get_instagram_stories():
    now = datetime.now(timezone.utc).isoformat()
    stories = await db.instagram.find({
        "is_story": True, 
        "is_active": True,
        "$or": [{"story_expires_at": {"$gt": now}}, {"story_expires_at": None}]
    }, {"_id": 0}).to_list(20)
    return {"has_stories": len(stories) > 0, "count": len(stories), "stories": stories}

@api_router.get("/settings", response_model=SiteSettings)
async def get_settings():
    settings = await db.settings.find_one({"id": "site_settings"}, {"_id": 0})
    if not settings:
        default = SiteSettings()
        await db.settings.insert_one(default.model_dump())
        return default
    return SiteSettings(**settings)

# CMS Public Endpoints
@api_router.get("/pages")
async def get_pages():
    pages = await db.pages.find({"is_published": True}, {"_id": 0}).sort("nav_order", 1).to_list(50)
    return pages

@api_router.get("/pages/{slug}")
async def get_page(slug: str):
    page = await db.pages.find_one({"slug": slug, "is_published": True}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    sections = await db.sections.find({"page_id": page["id"], "is_active": True}, {"_id": 0}).sort("order", 1).to_list(50)
    return {**page, "sections": sections}

@api_router.get("/sections/{page_id}")
async def get_page_sections(page_id: str):
    sections = await db.sections.find({"page_id": page_id, "is_active": True}, {"_id": 0}).sort("order", 1).to_list(50)
    return sections

@api_router.get("/homepage")
async def get_homepage():
    sections = await db.sections.find({"page_id": "home", "is_active": True}, {"_id": 0}).sort("order", 1).to_list(50)
    return {"sections": sections, "has_custom_sections": len(sections) > 0}

@api_router.post("/bookings", response_model=Booking)
async def create_booking(booking: BookingBase):
    booking_obj = Booking(**booking.model_dump())
    await db.bookings.insert_one(booking_obj.model_dump())
    return booking_obj

@api_router.post("/contacts", response_model=ContactMessage)
async def create_contact(contact: ContactMessageBase):
    contact_obj = ContactMessage(**contact.model_dump())
    await db.contacts.insert_one(contact_obj.model_dump())
    return contact_obj

# ========== ADMIN ENDPOINTS ==========

@api_router.get("/admin/verify")
async def verify_admin_credentials(username: str = Depends(verify_admin)):
    return {"status": "authenticated", "username": username}

# Trainers Admin
@api_router.get("/admin/trainers", response_model=List[Trainer])
async def admin_get_trainers(username: str = Depends(verify_admin)):
    return await db.trainers.find({}, {"_id": 0}).to_list(100)

@api_router.post("/admin/trainers", response_model=Trainer)
async def admin_create_trainer(trainer: TrainerBase, username: str = Depends(verify_admin)):
    trainer_obj = Trainer(**trainer.model_dump())
    await db.trainers.insert_one(trainer_obj.model_dump())
    return trainer_obj

@api_router.put("/admin/trainers/{trainer_id}", response_model=Trainer)
async def admin_update_trainer(trainer_id: str, trainer: TrainerBase, username: str = Depends(verify_admin)):
    result = await db.trainers.update_one({"id": trainer_id}, {"$set": trainer.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Trainer not found")
    updated = await db.trainers.find_one({"id": trainer_id}, {"_id": 0})
    return Trainer(**updated)

@api_router.delete("/admin/trainers/{trainer_id}")
async def admin_delete_trainer(trainer_id: str, username: str = Depends(verify_admin)):
    result = await db.trainers.delete_one({"id": trainer_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Trainer not found")
    return {"status": "deleted"}

# Schedule Admin
@api_router.get("/admin/schedule", response_model=List[ScheduleItem])
async def admin_get_schedule(username: str = Depends(verify_admin)):
    return await db.schedule.find({}, {"_id": 0}).to_list(100)

@api_router.post("/admin/schedule", response_model=ScheduleItem)
async def admin_create_schedule(item: ScheduleItemBase, username: str = Depends(verify_admin)):
    item_obj = ScheduleItem(**item.model_dump())
    await db.schedule.insert_one(item_obj.model_dump())
    return item_obj

@api_router.put("/admin/schedule/{item_id}", response_model=ScheduleItem)
async def admin_update_schedule(item_id: str, item: ScheduleItemBase, username: str = Depends(verify_admin)):
    result = await db.schedule.update_one({"id": item_id}, {"$set": item.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Schedule item not found")
    updated = await db.schedule.find_one({"id": item_id}, {"_id": 0})
    return ScheduleItem(**updated)

@api_router.delete("/admin/schedule/{item_id}")
async def admin_delete_schedule(item_id: str, username: str = Depends(verify_admin)):
    result = await db.schedule.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Schedule item not found")
    return {"status": "deleted"}

# Gallery Admin
@api_router.get("/admin/gallery", response_model=List[GalleryImage])
async def admin_get_gallery(username: str = Depends(verify_admin)):
    return await db.gallery.find({}, {"_id": 0}).sort("order", 1).to_list(100)

@api_router.post("/admin/gallery", response_model=GalleryImage)
async def admin_create_gallery_image(image: GalleryImageBase, username: str = Depends(verify_admin)):
    image_obj = GalleryImage(**image.model_dump())
    await db.gallery.insert_one(image_obj.model_dump())
    return image_obj

@api_router.put("/admin/gallery/{image_id}", response_model=GalleryImage)
async def admin_update_gallery_image(image_id: str, image: GalleryImageBase, username: str = Depends(verify_admin)):
    result = await db.gallery.update_one({"id": image_id}, {"$set": image.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Image not found")
    updated = await db.gallery.find_one({"id": image_id}, {"_id": 0})
    return GalleryImage(**updated)

@api_router.delete("/admin/gallery/{image_id}")
async def admin_delete_gallery_image(image_id: str, username: str = Depends(verify_admin)):
    result = await db.gallery.delete_one({"id": image_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Image not found")
    return {"status": "deleted"}

# Instagram Admin
@api_router.get("/admin/instagram", response_model=List[InstagramPost])
async def admin_get_instagram(username: str = Depends(verify_admin)):
    return await db.instagram.find({}, {"_id": 0}).sort("order", 1).to_list(100)

@api_router.post("/admin/instagram", response_model=InstagramPost)
async def admin_create_instagram_post(post: InstagramPostBase, username: str = Depends(verify_admin)):
    post_obj = InstagramPost(**post.model_dump())
    await db.instagram.insert_one(post_obj.model_dump())
    return post_obj

@api_router.put("/admin/instagram/{post_id}", response_model=InstagramPost)
async def admin_update_instagram_post(post_id: str, post: InstagramPostBase, username: str = Depends(verify_admin)):
    result = await db.instagram.update_one({"id": post_id}, {"$set": post.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    updated = await db.instagram.find_one({"id": post_id}, {"_id": 0})
    return InstagramPost(**updated)

@api_router.delete("/admin/instagram/{post_id}")
async def admin_delete_instagram_post(post_id: str, username: str = Depends(verify_admin)):
    result = await db.instagram.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"status": "deleted"}

# Bookings Admin
@api_router.get("/admin/bookings", response_model=List[Booking])
async def admin_get_bookings(username: str = Depends(verify_admin)):
    return await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)

@api_router.put("/admin/bookings/{booking_id}/status")
async def admin_update_booking_status(booking_id: str, status: str, username: str = Depends(verify_admin)):
    result = await db.bookings.update_one({"id": booking_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"status": "updated"}

@api_router.delete("/admin/bookings/{booking_id}")
async def admin_delete_booking(booking_id: str, username: str = Depends(verify_admin)):
    result = await db.bookings.delete_one({"id": booking_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"status": "deleted"}

# Contacts Admin
@api_router.get("/admin/contacts", response_model=List[ContactMessage])
async def admin_get_contacts(username: str = Depends(verify_admin)):
    return await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)

@api_router.put("/admin/contacts/{contact_id}/read")
async def admin_mark_contact_read(contact_id: str, username: str = Depends(verify_admin)):
    result = await db.contacts.update_one({"id": contact_id}, {"$set": {"is_read": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"status": "updated"}

@api_router.delete("/admin/contacts/{contact_id}")
async def admin_delete_contact(contact_id: str, username: str = Depends(verify_admin)):
    result = await db.contacts.delete_one({"id": contact_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"status": "deleted"}

# Settings Admin
@api_router.put("/admin/settings", response_model=SiteSettings)
async def admin_update_settings(settings: SiteSettingsBase, username: str = Depends(verify_admin)):
    settings_obj = SiteSettings(**settings.model_dump())
    await db.settings.update_one({"id": "site_settings"}, {"$set": settings_obj.model_dump()}, upsert=True)
    return settings_obj

# ========== CMS ADMIN - PAGES ==========

@api_router.get("/admin/pages")
async def admin_get_pages(username: str = Depends(verify_admin)):
    return await db.pages.find({}, {"_id": 0}).sort("nav_order", 1).to_list(100)

@api_router.post("/admin/pages", response_model=Page)
async def admin_create_page(page: PageBase, username: str = Depends(verify_admin)):
    existing = await db.pages.find_one({"slug": page.slug})
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")
    page_obj = Page(**page.model_dump())
    await db.pages.insert_one(page_obj.model_dump())
    return page_obj

@api_router.get("/admin/pages/{page_id}")
async def admin_get_page(page_id: str, username: str = Depends(verify_admin)):
    page = await db.pages.find_one({"id": page_id}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page

@api_router.put("/admin/pages/{page_id}", response_model=Page)
async def admin_update_page(page_id: str, page: PageBase, username: str = Depends(verify_admin)):
    result = await db.pages.update_one({"id": page_id}, {"$set": page.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Page not found")
    updated = await db.pages.find_one({"id": page_id}, {"_id": 0})
    return Page(**updated)

@api_router.delete("/admin/pages/{page_id}")
async def admin_delete_page(page_id: str, username: str = Depends(verify_admin)):
    await db.sections.delete_many({"page_id": page_id})
    result = await db.pages.delete_one({"id": page_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Page not found")
    return {"status": "deleted"}

# ========== CMS ADMIN - SECTIONS ==========

@api_router.get("/admin/sections")
async def admin_get_all_sections(username: str = Depends(verify_admin)):
    return await db.sections.find({}, {"_id": 0}).sort([("page_id", 1), ("order", 1)]).to_list(200)

@api_router.get("/admin/sections/page/{page_id}")
async def admin_get_sections_by_page(page_id: str, username: str = Depends(verify_admin)):
    return await db.sections.find({"page_id": page_id}, {"_id": 0}).sort("order", 1).to_list(50)

@api_router.post("/admin/sections")
async def admin_create_section(section: PageSectionBase, page_id: str = "home", username: str = Depends(verify_admin)):
    section_obj = PageSection(**section.model_dump(), page_id=page_id)
    await db.sections.insert_one(section_obj.model_dump())
    return section_obj.model_dump()

@api_router.get("/admin/sections/{section_id}")
async def admin_get_section(section_id: str, username: str = Depends(verify_admin)):
    section = await db.sections.find_one({"id": section_id}, {"_id": 0})
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    return section

@api_router.put("/admin/sections/{section_id}")
async def admin_update_section(section_id: str, section: PageSectionBase, username: str = Depends(verify_admin)):
    result = await db.sections.update_one({"id": section_id}, {"$set": section.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Section not found")
    updated = await db.sections.find_one({"id": section_id}, {"_id": 0})
    return updated

@api_router.delete("/admin/sections/{section_id}")
async def admin_delete_section(section_id: str, username: str = Depends(verify_admin)):
    result = await db.sections.delete_one({"id": section_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Section not found")
    return {"status": "deleted"}

@api_router.put("/admin/sections/reorder/{page_id}")
async def admin_reorder_sections(page_id: str, orders: List[dict], username: str = Depends(verify_admin)):
    for item in orders:
        await db.sections.update_one({"id": item["id"]}, {"$set": {"order": item["order"]}})
    return {"status": "reordered"}

# Initialize Homepage Sections
@api_router.post("/admin/init-homepage")
async def admin_init_homepage(username: str = Depends(verify_admin)):
    existing = await db.sections.find_one({"page_id": "home"})
    if existing:
        return {"status": "already_initialized"}
    
    sections = [
        {"section_type": "hero", "title_de": "ENTDECKE DEN WRESTLER IN DIR", "title_en": "DISCOVER THE WRESTLER WITHIN", 
         "subtitle_de": "Catch- und Wrestlingtraining vor den Toren Hannovers", "subtitle_en": "Catch and wrestling training near Hannover",
         "background_image": "https://images.unsplash.com/photo-1623950851918-116ba38150d2?w=1920", "order": 0,
         "settings": {"cta_text_de": "Probetraining buchen", "cta_text_en": "Book Trial Training", "cta_link": "/booking"}},
        {"section_type": "about", "title_de": "ÜBER UNS", "title_en": "ABOUT US", "subtitle_de": "Headlock Headquarter", "subtitle_en": "Headlock Headquarter",
         "content_de": "In den Räumen der VBZ Nord GmbH in Hannover ist die Wrestling Schule beheimatet.", 
         "content_en": "Located in the premises of VBZ Nord GmbH in Hannover, the Wrestling School is home.", "order": 1},
        {"section_type": "trainers", "title_de": "UNSER TEAM", "title_en": "OUR TEAM", "subtitle_de": "Erfahrene Profis", "subtitle_en": "Experienced professionals", "order": 2},
        {"section_type": "schedule", "title_de": "TRAININGSZEITEN", "title_en": "TRAINING SCHEDULE", "order": 3},
        {"section_type": "gallery", "title_de": "GALERIE", "title_en": "GALLERY", "order": 4},
        {"section_type": "instagram", "title_de": "FOLGE UNS", "title_en": "FOLLOW US", "order": 5},
        {"section_type": "reviews", "title_de": "BEWERTUNGEN", "title_en": "REVIEWS", "order": 6},
        {"section_type": "contact", "title_de": "KONTAKT", "title_en": "CONTACT", "order": 7}
    ]
    
    for s in sections:
        section_obj = PageSection(**s, page_id="home")
        await db.sections.insert_one(section_obj.model_dump())
    
    return {"status": "initialized", "count": len(sections)}

# ========== AUTH ENDPOINTS ==========

@api_router.post("/auth/login")
async def user_login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db.users.find_one({"email": form_data.username, "is_active": True}, {"_id": 0})
    if not user or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Ungültige Anmeldedaten")
    token = create_access_token({"sub": user["id"], "role": user["role"]})
    return {"access_token": token, "token_type": "bearer", "user": UserOut(**user).model_dump()}

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return UserOut(**user).model_dump()

@api_router.put("/auth/profile")
async def update_profile(updates: UserUpdate, user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    if update_data:
        await db.users.update_one({"id": user["id"]}, {"$set": update_data})
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    return UserOut(**updated).model_dump()

@api_router.put("/auth/password")
async def change_password(current_password: str, new_password: str, user: dict = Depends(get_current_user)):
    if not verify_password(current_password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Aktuelles Passwort ist falsch")
    await db.users.update_one({"id": user["id"]}, {"$set": {"password_hash": hash_password(new_password)}})
    return {"status": "password_changed"}

# ========== ADMIN USER MANAGEMENT ==========

@api_router.get("/admin/users")
async def admin_get_users(username: str = Depends(verify_admin)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(500)
    return users

@api_router.post("/admin/users")
async def admin_create_user(user_data: UserCreate, username: str = Depends(verify_admin)):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="E-Mail existiert bereits")
    if user_data.role not in ("student", "trainer"):
        raise HTTPException(status_code=400, detail="Rolle muss 'student' oder 'trainer' sein")
    user_doc = {
        "id": str(uuid.uuid4()),
        "name": user_data.name,
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "role": user_data.role,
        "phone": user_data.phone,
        "bio": "", "image_url": "", "experience_level": "", "emergency_contact": "", "weight_class": "",
        "is_active": True,
        "created_by": username,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    # Send welcome email
    await send_email(user_data.email, "Willkommen bei Headlock Headquarter",
        f"<h2>Willkommen, {user_data.name}!</h2>"
        f"<p>Dein Account bei Headlock Headquarter wurde erstellt.</p>"
        f"<p><b>E-Mail:</b> {user_data.email}</p>"
        f"<p><b>Passwort:</b> {user_data.password}</p>"
        f"<p>Bitte ändere dein Passwort nach dem ersten Login.</p>")
    return {k: v for k, v in user_doc.items() if k != "password_hash" and k != "_id"}

@api_router.put("/admin/users/{user_id}")
async def admin_update_user(user_id: str, updates: dict, username: str = Depends(verify_admin)):
    safe_fields = {"name", "email", "phone", "role", "is_active", "experience_level", "bio", "image_url"}
    update_data = {k: v for k, v in updates.items() if k in safe_fields}
    if "password" in updates and updates["password"]:
        update_data["password_hash"] = hash_password(updates["password"])
    if update_data:
        await db.users.update_one({"id": user_id}, {"$set": update_data})
    updated = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated

@api_router.delete("/admin/users/{user_id}")
async def admin_delete_user(user_id: str, username: str = Depends(verify_admin)):
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    await db.attendance.delete_many({"user_id": user_id})
    await db.notifications.delete_many({"user_id": user_id})
    return {"status": "deleted"}

# ========== TRAINING SESSIONS ==========

@api_router.get("/sessions")
async def get_sessions(user: dict = Depends(get_current_user)):
    sessions = await db.training_sessions.find(
        {"date": {"$gte": datetime.now(timezone.utc).strftime("%Y-%m-%d")}},
        {"_id": 0}
    ).sort("date", 1).to_list(50)
    # Attach attendance for current user
    for session in sessions:
        att = await db.attendance.find_one({"session_id": session["id"], "user_id": user["id"]}, {"_id": 0})
        session["my_status"] = att["status"] if att else "pending"
    return sessions

@api_router.get("/sessions/all")
async def get_all_sessions(user: dict = Depends(get_current_user)):
    await require_role(user, ["trainer"])
    sessions = await db.training_sessions.find({}, {"_id": 0}).sort("date", -1).to_list(200)
    for session in sessions:
        attendees = await db.attendance.find({"session_id": session["id"]}, {"_id": 0}).to_list(100)
        session["attendees"] = attendees
        session["confirmed_count"] = sum(1 for a in attendees if a["status"] == "confirmed")
        session["declined_count"] = sum(1 for a in attendees if a["status"] == "declined")
        session["pending_count"] = sum(1 for a in attendees if a["status"] == "pending")
    return sessions

@api_router.post("/sessions")
async def create_session(session_data: TrainingSessionBase, user: dict = Depends(get_current_user)):
    await require_role(user, ["trainer"])
    session = TrainingSession(**session_data.model_dump(), created_by=user["id"])
    await db.training_sessions.insert_one(session.model_dump())
    # Create pending attendance for all active students
    students = await db.users.find({"role": "student", "is_active": True}, {"_id": 0}).to_list(500)
    for student in students:
        att = Attendance(session_id=session.id, user_id=student["id"], user_name=student["name"])
        await db.attendance.insert_one(att.model_dump())
        # Create notification
        schedule = await db.schedule.find_one({"id": session_data.schedule_id}, {"_id": 0})
        title_de = schedule["title_de"] if schedule else "Training"
        title_en = schedule["title_en"] if schedule else "Training"
        await db.notifications.insert_one({
            "id": str(uuid.uuid4()), "user_id": student["id"], "type": "new_session",
            "message_de": f"Neues Training am {session_data.date}: {title_de}. Bitte zu- oder absagen.",
            "message_en": f"New training on {session_data.date}: {title_en}. Please confirm or decline.",
            "is_read": False, "created_at": datetime.now(timezone.utc).isoformat()
        })
    return session.model_dump()

@api_router.put("/sessions/{session_id}")
async def update_session(session_id: str, updates: TrainingSessionBase, user: dict = Depends(get_current_user)):
    await require_role(user, ["trainer"])
    result = await db.training_sessions.update_one({"id": session_id}, {"$set": updates.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    updated = await db.training_sessions.find_one({"id": session_id}, {"_id": 0})
    return updated

@api_router.delete("/sessions/{session_id}")
async def delete_session(session_id: str, user: dict = Depends(get_current_user)):
    await require_role(user, ["trainer"])
    result = await db.training_sessions.delete_one({"id": session_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    await db.attendance.delete_many({"session_id": session_id})
    return {"status": "deleted"}

# ========== ATTENDANCE / RSVP ==========

@api_router.put("/attendance/{session_id}")
async def update_attendance(session_id: str, data: AttendanceUpdate, user: dict = Depends(get_current_user)):
    if data.status not in ("confirmed", "declined"):
        raise HTTPException(status_code=400, detail="Status muss 'confirmed' oder 'declined' sein")
    result = await db.attendance.update_one(
        {"session_id": session_id, "user_id": user["id"]},
        {"$set": {"status": data.status, "responded_at": datetime.now(timezone.utc).isoformat(), "user_name": user["name"]}},
        upsert=True
    )
    return {"status": "updated", "attendance_status": data.status}

@api_router.get("/attendance/{session_id}")
async def get_attendance(session_id: str, user: dict = Depends(get_current_user)):
    await require_role(user, ["trainer"])
    attendees = await db.attendance.find({"session_id": session_id}, {"_id": 0}).to_list(200)
    return attendees

# ========== NOTIFICATIONS ==========

@api_router.get("/notifications")
async def get_notifications(user: dict = Depends(get_current_user)):
    notifs = await db.notifications.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return notifs

@api_router.put("/notifications/{notif_id}/read")
async def mark_notification_read(notif_id: str, user: dict = Depends(get_current_user)):
    await db.notifications.update_one({"id": notif_id, "user_id": user["id"]}, {"$set": {"is_read": True}})
    return {"status": "read"}

@api_router.put("/notifications/read-all")
async def mark_all_notifications_read(user: dict = Depends(get_current_user)):
    await db.notifications.update_many({"user_id": user["id"]}, {"$set": {"is_read": True}})
    return {"status": "all_read"}

# ========== REMINDER SYSTEM ==========

async def check_and_send_reminders():
    """Check for training sessions within 24h and send reminders to students without RSVP."""
    now = datetime.now(timezone.utc)
    tomorrow = (now + timedelta(hours=24)).strftime("%Y-%m-%d")
    today = now.strftime("%Y-%m-%d")

    sessions = await db.training_sessions.find({
        "date": {"$gte": today, "$lte": tomorrow},
        "is_cancelled": False
    }, {"_id": 0}).to_list(50)

    for session in sessions:
        pending = await db.attendance.find({
            "session_id": session["id"], "status": "pending"
        }, {"_id": 0}).to_list(200)

        schedule = await db.schedule.find_one({"id": session.get("schedule_id", "")}, {"_id": 0})
        title = schedule["title_de"] if schedule else "Training"

        for att in pending:
            user = await db.users.find_one({"id": att["user_id"], "is_active": True}, {"_id": 0})
            if not user:
                continue
            # Check if reminder already sent
            existing = await db.notifications.find_one({
                "user_id": user["id"], "type": "reminder",
                "message_de": {"$regex": session["date"]}
            })
            if existing:
                continue
            # Create notification
            await db.notifications.insert_one({
                "id": str(uuid.uuid4()), "user_id": user["id"], "type": "reminder",
                "message_de": f"Erinnerung: {title} am {session['date']} ({session.get('time_start', '')}). Du hast noch nicht zu- oder abgesagt!",
                "message_en": f"Reminder: {title} on {session['date']} ({session.get('time_start', '')}). You haven't responded yet!",
                "is_read": False, "created_at": datetime.now(timezone.utc).isoformat()
            })
            # Send email
            if user.get("email"):
                await send_email(user["email"],
                    f"Erinnerung: {title} am {session['date']}",
                    f"<h2>Training-Erinnerung</h2>"
                    f"<p>Hallo {user['name']},</p>"
                    f"<p>Du hast noch nicht für das Training am <b>{session['date']}</b> zu- oder abgesagt:</p>"
                    f"<p><b>{title}</b></p>"
                    f"<p>Bitte logge dich ein und gib deine Rückmeldung.</p>"
                    f"<p>Dein Headlock Headquarter Team</p>")

# Background task starter
async def reminder_loop():
    while True:
        try:
            await check_and_send_reminders()
        except Exception as e:
            logging.error(f"Reminder check error: {e}")
        await asyncio.sleep(3600)  # Check every hour

@app.on_event("startup")
async def start_reminder_task():
    asyncio.create_task(reminder_loop())

# ========== FILE UPLOAD ==========

ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}

@api_router.post("/admin/upload/{category}")
async def upload_image(category: str, file: UploadFile = File(...), username: str = Depends(verify_admin)):
    if category not in ['gallery', 'trainers', 'instagram', 'pages', 'profiles']:
        raise HTTPException(status_code=400, detail="Invalid category")
    
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")
    
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    filename = f"{uuid.uuid4()}{ext}"
    file_path = UPLOADS_DIR / category / filename
    
    with open(file_path, 'wb') as f:
        f.write(content)
    
    return {"url": f"/api/uploads/{category}/{filename}", "filename": filename}

@api_router.delete("/admin/upload/{category}/{filename}")
async def delete_uploaded_image(category: str, filename: str, username: str = Depends(verify_admin)):
    file_path = UPLOADS_DIR / category / filename
    if file_path.exists():
        file_path.unlink()
        return {"status": "deleted"}
    raise HTTPException(status_code=404, detail="File not found")

@api_router.post("/upload/profile")
async def upload_profile_image(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid file type")
    filename = f"{uuid.uuid4()}{ext}"
    file_path = UPLOADS_DIR / 'profiles' / filename
    with open(file_path, 'wb') as f:
        f.write(content)
    url = f"/api/uploads/profiles/{filename}"
    await db.users.update_one({"id": user["id"]}, {"$set": {"image_url": url}})
    return {"url": url}

# Seed initial data
@api_router.post("/admin/seed")
async def seed_data(username: str = Depends(verify_admin)):
    existing = await db.trainers.find_one({})
    if existing:
        return {"status": "already_seeded"}
    
    trainers = [
        Trainer(name="Leon van Gasteren", title="Head Coach",
            bio_de="Er wurde 1994 beim legendären CWA World Cup in Hannover trainiert und ist nach über 25 Jahren immer noch aktiv.",
            bio_en="He was trained in 1994 at the legendary CWA World Cup in Hannover and is still active after over 25 years.",
            image_url="https://images.unsplash.com/photo-1634042341465-f08e0d10a670?w=600",
            years_experience=30, achievements=["CWA World Cup 1994", "International Wrestler"]),
        Trainer(name="Martin Nolte", title="Senior Coach",
            bio_de="Martin Nolte hat 1997 mit professionellem Training unter Tony St. Clair angefangen.",
            bio_en="Martin Nolte started professional training under Tony St. Clair in 1997.",
            image_url="https://images.unsplash.com/photo-1730732862473-dba100ea08b2?w=600",
            years_experience=26, achievements=["Newcomer of the Year 1999", "Multiple Title Holder"])
    ]
    for t in trainers:
        await db.trainers.insert_one(t.model_dump())
    
    schedule = [ScheduleItem(day_de="Samstag", day_en="Saturday", time_start="12:00", time_end="16:00",
        title_de="Wöchentliches Training", title_en="Weekly Training",
        description_de="Traditionelles Catch- und Wrestlingtraining", description_en="Traditional catch and wrestling training")]
    for s in schedule:
        await db.schedule.insert_one(s.model_dump())
    
    gallery = [
        GalleryImage(url="https://images.unsplash.com/photo-1623950851918-116ba38150d2?w=800", title="Training", order=1),
        GalleryImage(url="https://images.unsplash.com/photo-1611338631743-b0362363f417?w=800", title="Grappling", order=2),
        GalleryImage(url="https://images.unsplash.com/photo-1644428321939-efd594294e8e?w=800", title="Equipment", order=3)
    ]
    for g in gallery:
        await db.gallery.insert_one(g.model_dump())
    
    return {"status": "seeded"}

# Include router and mount static files
app.include_router(api_router)
app.mount("/api/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
