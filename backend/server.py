from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import secrets
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create uploads directory
UPLOADS_DIR = ROOT_DIR / 'uploads'
UPLOADS_DIR.mkdir(exist_ok=True)
(UPLOADS_DIR / 'gallery').mkdir(exist_ok=True)
(UPLOADS_DIR / 'trainers').mkdir(exist_ok=True)
(UPLOADS_DIR / 'instagram').mkdir(exist_ok=True)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="Headlock Headquarter API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBasic()

# Admin credentials (in production, use environment variables)
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'headlock2024')

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

class InstagramPostBase(BaseModel):
    post_url: str
    thumbnail_url: str = ""
    caption: str = ""
    post_type: str = "image"  # image, video, reel, embed
    is_story: bool = False
    story_expires_at: Optional[str] = None
    is_active: bool = True
    order: int = 0
    embed_code: str = ""  # For Instagram embed HTML

class InstagramPost(InstagramPostBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class GalleryImage(GalleryImageBase):
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

class SectionContentBase(BaseModel):
    """Content block within a section - supports multiple content types"""
    type: str = "text"  # text, image, button, stat, list
    content_de: str = ""
    content_en: str = ""
    image_url: str = ""
    link_url: str = ""
    order: int = 0
    style: dict = {}  # Custom CSS/styling options

class SectionContent(SectionContentBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

class PageSectionBase(BaseModel):
    """A section on a page (hero, about, etc.)"""
    section_type: str  # hero, about, trainers, schedule, gallery, instagram, reviews, contact, custom
    title_de: str = ""
    title_en: str = ""
    subtitle_de: str = ""
    subtitle_en: str = ""
    description_de: str = ""
    description_en: str = ""
    background_image: str = ""
    background_color: str = ""
    is_active: bool = True
    order: int = 0
    settings: dict = {}  # Section-specific settings
    content_blocks: List[dict] = []  # List of content blocks

class PageSection(PageSectionBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    page_id: str = "home"  # Which page this section belongs to
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class PageBase(BaseModel):
    """A page on the website"""
    slug: str  # URL slug (e.g., "about", "impressum")
    title_de: str
    title_en: str
    meta_description_de: str = ""
    meta_description_en: str = ""
    is_published: bool = True
    is_in_navigation: bool = True
    navigation_order: int = 0
    template: str = "default"  # default, landing, simple
    custom_css: str = ""

class Page(PageBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

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
    # Get active stories (not expired)
    now = datetime.now(timezone.utc).isoformat()
    stories = await db.instagram.find({
        "is_story": True, 
        "is_active": True,
        "$or": [
            {"story_expires_at": {"$gt": now}},
            {"story_expires_at": None}
        ]
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

# ========== CMS PUBLIC ENDPOINTS ==========

@api_router.get("/pages")
async def get_pages():
    """Get all published pages for navigation"""
    pages = await db.pages.find({"is_published": True}, {"_id": 0}).sort("navigation_order", 1).to_list(50)
    return pages

@api_router.get("/pages/{slug}")
async def get_page(slug: str):
    """Get a specific page by slug"""
    page = await db.pages.find_one({"slug": slug, "is_published": True}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page

@api_router.get("/pages/{slug}/sections")
async def get_page_sections(slug: str):
    """Get all sections for a page"""
    # First check if page exists
    page = await db.pages.find_one({"slug": slug}, {"_id": 0})
    page_id = page["id"] if page else slug
    
    sections = await db.sections.find(
        {"page_id": page_id, "is_active": True}, 
        {"_id": 0}
    ).sort("order", 1).to_list(50)
    return sections

@api_router.get("/sections/{section_id}")
async def get_section(section_id: str):
    """Get a specific section by ID"""
    section = await db.sections.find_one({"id": section_id}, {"_id": 0})
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    return section

@api_router.get("/homepage")
async def get_homepage_content():
    """Get all homepage sections in one call"""
    sections = await db.sections.find(
        {"page_id": "home", "is_active": True}, 
        {"_id": 0}
    ).sort("order", 1).to_list(50)
    
    # If no sections exist, return default structure
    if not sections:
        return {
            "sections": [],
            "default": True
        }
    return {"sections": sections, "default": False}

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
    trainers = await db.trainers.find({}, {"_id": 0}).to_list(100)
    return trainers

@api_router.post("/admin/trainers", response_model=Trainer)
async def admin_create_trainer(trainer: TrainerBase, username: str = Depends(verify_admin)):
    trainer_obj = Trainer(**trainer.model_dump())
    await db.trainers.insert_one(trainer_obj.model_dump())
    return trainer_obj

@api_router.put("/admin/trainers/{trainer_id}", response_model=Trainer)
async def admin_update_trainer(trainer_id: str, trainer: TrainerBase, username: str = Depends(verify_admin)):
    result = await db.trainers.update_one(
        {"id": trainer_id},
        {"$set": trainer.model_dump()}
    )
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
    items = await db.schedule.find({}, {"_id": 0}).to_list(100)
    return items

@api_router.post("/admin/schedule", response_model=ScheduleItem)
async def admin_create_schedule(item: ScheduleItemBase, username: str = Depends(verify_admin)):
    item_obj = ScheduleItem(**item.model_dump())
    await db.schedule.insert_one(item_obj.model_dump())
    return item_obj

@api_router.put("/admin/schedule/{item_id}", response_model=ScheduleItem)
async def admin_update_schedule(item_id: str, item: ScheduleItemBase, username: str = Depends(verify_admin)):
    result = await db.schedule.update_one(
        {"id": item_id},
        {"$set": item.model_dump()}
    )
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
    images = await db.gallery.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return images

@api_router.post("/admin/gallery", response_model=GalleryImage)
async def admin_create_gallery_image(image: GalleryImageBase, username: str = Depends(verify_admin)):
    image_obj = GalleryImage(**image.model_dump())
    await db.gallery.insert_one(image_obj.model_dump())
    return image_obj

@api_router.put("/admin/gallery/{image_id}", response_model=GalleryImage)
async def admin_update_gallery_image(image_id: str, image: GalleryImageBase, username: str = Depends(verify_admin)):
    result = await db.gallery.update_one(
        {"id": image_id},
        {"$set": image.model_dump()}
    )
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
    posts = await db.instagram.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return posts

@api_router.post("/admin/instagram", response_model=InstagramPost)
async def admin_create_instagram_post(post: InstagramPostBase, username: str = Depends(verify_admin)):
    post_obj = InstagramPost(**post.model_dump())
    await db.instagram.insert_one(post_obj.model_dump())
    return post_obj

@api_router.put("/admin/instagram/{post_id}", response_model=InstagramPost)
async def admin_update_instagram_post(post_id: str, post: InstagramPostBase, username: str = Depends(verify_admin)):
    result = await db.instagram.update_one(
        {"id": post_id},
        {"$set": post.model_dump()}
    )
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

# ========== FILE UPLOAD ENDPOINTS ==========

ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def validate_image(filename: str, file_size: int) -> bool:
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type not allowed. Allowed: {ALLOWED_EXTENSIONS}")
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail=f"File too large. Max size: 10MB")
    return True

@api_router.post("/admin/upload/{category}")
async def upload_image(
    category: str,
    file: UploadFile = File(...),
    username: str = Depends(verify_admin)
):
    if category not in ['gallery', 'trainers', 'instagram']:
        raise HTTPException(status_code=400, detail="Invalid category")
    
    # Read file content
    content = await file.read()
    validate_image(file.filename, len(content))
    
    # Generate unique filename
    ext = Path(file.filename).suffix.lower()
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = UPLOADS_DIR / category / unique_filename
    
    # Save file
    with open(file_path, 'wb') as f:
        f.write(content)
    
    # Return the URL path
    url = f"/api/uploads/{category}/{unique_filename}"
    return {"url": url, "filename": unique_filename}

@api_router.delete("/admin/upload/{category}/{filename}")
async def delete_uploaded_image(
    category: str,
    filename: str,
    username: str = Depends(verify_admin)
):
    if category not in ['gallery', 'trainers', 'instagram']:
        raise HTTPException(status_code=400, detail="Invalid category")
    
    file_path = UPLOADS_DIR / category / filename
    if file_path.exists():
        file_path.unlink()
        return {"status": "deleted"}
    raise HTTPException(status_code=404, detail="File not found")

# Bookings Admin
@api_router.get("/admin/bookings", response_model=List[Booking])
async def admin_get_bookings(username: str = Depends(verify_admin)):
    bookings = await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return bookings

@api_router.put("/admin/bookings/{booking_id}/status")
async def admin_update_booking_status(booking_id: str, status: str, username: str = Depends(verify_admin)):
    result = await db.bookings.update_one(
        {"id": booking_id},
        {"$set": {"status": status}}
    )
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
    contacts = await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return contacts

@api_router.put("/admin/contacts/{contact_id}/read")
async def admin_mark_contact_read(contact_id: str, username: str = Depends(verify_admin)):
    result = await db.contacts.update_one(
        {"id": contact_id},
        {"$set": {"is_read": True}}
    )
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
    await db.settings.update_one(
        {"id": "site_settings"},
        {"$set": settings_obj.model_dump()},
        upsert=True
    )
    return settings_obj

# Seed initial data
@api_router.post("/admin/seed")
async def seed_data(username: str = Depends(verify_admin)):
    # Check if already seeded
    existing = await db.trainers.find_one({})
    if existing:
        return {"status": "already_seeded"}
    
    # Seed trainers
    trainers = [
        Trainer(
            name="Leon van Gasteren",
            title="Head Coach",
            bio_de="Er wurde 1994 beim legendären CWA World Cup in Hannover auf dem Schützenplatz trainiert und ist nach über 25 Jahren immer noch aktiv - national und international, wie seine Auftritte in Japan beweisen.",
            bio_en="He was trained in 1994 at the legendary CWA World Cup in Hannover at the Schützenplatz and is still active after over 25 years - nationally and internationally, as his appearances in Japan prove.",
            image_url="https://images.unsplash.com/photo-1634042341465-f08e0d10a670?w=600",
            years_experience=30,
            achievements=["CWA World Cup 1994", "International Wrestler", "Japan Tours"]
        ),
        Trainer(
            name="Martin Nolte",
            title="Senior Coach",
            bio_de="Martin Nolte hat 1997 mit professionellem Training unter Tony St. Clair angefangen. 1999 hatte er seinen ersten Profikampf und errung den Titel 'Newcomer des Jahres'. Bis zu seinem letzten Kampf im Jahr 2013 kämpfte er in vielen Ligen und errang mehrere Titel.",
            bio_en="Martin Nolte started professional training under Tony St. Clair in 1997. In 1999 he had his first professional fight and won the title 'Newcomer of the Year'. Until his last fight in 2013, he fought in many leagues and won several titles.",
            image_url="https://images.unsplash.com/photo-1730732862473-dba100ea08b2?w=600",
            years_experience=26,
            achievements=["Newcomer of the Year 1999", "Multiple Title Holder", "Tony St. Clair Trained"]
        )
    ]
    for t in trainers:
        await db.trainers.insert_one(t.model_dump())
    
    # Seed schedule
    schedule = [
        ScheduleItem(
            day_de="Samstag",
            day_en="Saturday",
            time_start="12:00",
            time_end="16:00",
            title_de="Wöchentliches Training",
            title_en="Weekly Training",
            description_de="Traditionelles Catch- und Wrestlingtraining für alle Levels",
            description_en="Traditional catch and wrestling training for all levels"
        )
    ]
    for s in schedule:
        await db.schedule.insert_one(s.model_dump())
    
    # Seed gallery
    gallery = [
        GalleryImage(
            url="https://images.unsplash.com/photo-1623950851918-116ba38150d2?w=800",
            title="Training Session",
            category="training",
            order=1
        ),
        GalleryImage(
            url="https://images.unsplash.com/photo-1611338631743-b0362363f417?w=800",
            title="Grappling Practice",
            category="training",
            order=2
        ),
        GalleryImage(
            url="https://images.unsplash.com/photo-1644428321939-efd594294e8e?w=800",
            title="Equipment",
            category="facility",
            order=3
        )
    ]
    for g in gallery:
        await db.gallery.insert_one(g.model_dump())
    
    return {"status": "seeded", "trainers": len(trainers), "schedule": len(schedule), "gallery": len(gallery)}

# Include the router in the main app
app.include_router(api_router)

# Mount uploads directory for serving static files
app.mount("/api/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
