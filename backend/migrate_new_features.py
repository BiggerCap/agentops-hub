"""
Database Migration Script - Add New Features Tables

Creates tables for:
1. Conversations and Messages (agent memory)
2. Run Attachments (vision capabilities)
3. Adds conversation_id column to runs table

Run this script to add new features to your database.
"""

from sqlalchemy import create_engine, text
from app.core.config import settings
from app.db.session import Base
from app.models import Conversation, Message, RunAttachment, Run  # Import new models

# Import all models to ensure they're registered
from app.models import *


def create_new_tables():
    """Create new tables and update existing ones"""
    engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
    
    print("Creating new tables...")
    
    # Create only new tables (existing tables won't be affected)
    Base.metadata.create_all(bind=engine, checkfirst=True)
    
    print("✅ New tables created successfully!")
    print("   - conversations")
    print("   - messages")
    print("   - run_attachments")
    
    # Add conversation_id column to runs table if it doesn't exist
    print("\nUpdating runs table...")
    with engine.connect() as conn:
        # Check if column exists
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'runs' AND column_name = 'conversation_id'
        """))
        
        if result.fetchone() is None:
            print("   Adding conversation_id column to runs table...")
            conn.execute(text("""
                ALTER TABLE runs 
                ADD COLUMN conversation_id INTEGER REFERENCES conversations(id) ON DELETE SET NULL
            """))
            conn.commit()
            print("   ✅ conversation_id column added")
        else:
            print("   ✅ conversation_id column already exists")
    
    # Verify tables exist
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('conversations', 'messages', 'run_attachments')
            ORDER BY table_name
        """))
        tables = [row[0] for row in result]
        
        if len(tables) == 3:
            print(f"\n✅ Verified: All 3 new tables exist in database")
        else:
            print(f"\n⚠️  Warning: Expected 3 tables, found {len(tables)}: {tables}")
    
    engine.dispose()


if __name__ == "__main__":
    print("="*70)
    print("DATABASE MIGRATION: Adding New Features")
    print("="*70)
    print("\nThis will:")
    print("  1. Create conversations table (agent memory)")
    print("  2. Create messages table (conversation history)")
    print("  3. Create run_attachments table (vision capabilities)")
    print("  4. Add conversation_id column to runs table")
    print("\n⚠️  Existing tables and data will NOT be affected")
    print("="*70)
    
    input("\nPress Enter to continue or Ctrl+C to cancel...")
    
    try:
        create_new_tables()
        print("\n" + "="*70)
        print("MIGRATION COMPLETED SUCCESSFULLY!")
        print("="*70)
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        raise
