"""
YouTube Service - Extract transcripts from YouTube videos
"""

from youtube_transcript_api import YouTubeTranscriptApi
import re
from typing import Optional


def extract_video_id(url: str) -> Optional[str]:
    """
    Extract YouTube video ID from various URL formats
    
    Supports:
    - https://www.youtube.com/watch?v=VIDEO_ID
    - https://youtu.be/VIDEO_ID
    - https://www.youtube.com/embed/VIDEO_ID
    """
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
        r'youtube\.com\/watch\?.*v=([^&\n?#]+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    return None


def get_youtube_transcript(url: str, include_timestamps: bool = True) -> dict:
    """
    Get transcript from a YouTube video
    
    Args:
        url: YouTube video URL
        include_timestamps: Whether to include timestamps in the formatted transcript
        
    Returns:
        Dict with 'video_id', 'url', 'transcript', 'transcript_plain', 'duration' keys
        
    Raises:
        Exception: If transcript extraction fails
    """
    try:
        # Extract video ID
        video_id = extract_video_id(url)
        if not video_id:
            raise Exception("Invalid YouTube URL. Could not extract video ID.")
        
        # Get transcript using instance-based API
        try:
            api = YouTubeTranscriptApi()
            transcript_list = api.list(video_id)
            
            # Try to find English transcript first
            try:
                transcript = transcript_list.find_transcript(['en'])
            except:
                # Fall back to any generated English transcript
                try:
                    transcript = transcript_list.find_generated_transcript(['en', 'en-US'])
                except:
                    # Last resort: get any available transcript
                    transcript = transcript_list.find_transcript(transcript_list._manually_created_transcripts.keys() or transcript_list._generated_transcripts.keys())
            
            # Fetch the actual transcript data
            transcript_data = transcript.fetch()
        except Exception as e:
            raise Exception(f"Could not retrieve transcript. Video may not have captions available. Error: {str(e)}")
        
        # Format transcript with timestamps (if requested)
        if include_timestamps:
            formatted_lines = []
            for entry in transcript_data:
                # The fetch() method returns FetchedTranscriptSnippet objects
                timestamp = entry.start
                text = entry.text
                minutes = int(timestamp // 60)
                seconds = int(timestamp % 60)
                formatted_lines.append(f"[{minutes:02d}:{seconds:02d}] {text}")
            full_transcript = "\n".join(formatted_lines)
        else:
            # Just join the text without timestamps
            full_transcript = " ".join(entry.text for entry in transcript_data)
        
        # Also create a plain text version without timestamps
        plain_text = " ".join(entry.text for entry in transcript_data)
        
        # Calculate duration from last entry
        duration = transcript_data[-1].start + transcript_data[-1].duration if transcript_data else 0
        
        return {
            "video_id": video_id,
            "url": url,
            "transcript": full_transcript,
            "transcript_plain": plain_text,
            "duration": duration
        }
        
    except Exception as e:
        raise Exception(f"Failed to get YouTube transcript: {str(e)}")
