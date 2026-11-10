"""
NIRBHAYA X - Factual Incident Summarizer & Completeness Scorer
Generates neutral, non-accusatory incident summaries and computes evidence completeness (0-100%).
"""
from typing import List, Dict, Any

def generate_factual_summary(
    media_type: str,
    persons_count: int,
    faces_count: int,
    transcript: str = None,
    metadata: dict = None
) -> str:
    """
    Generate an objective, neutral statement of facts.
    Strictly avoids accusations, defamation, or unsubstantiated speculation.
    """
    summary_parts = []

    # Scene context
    if media_type in ['video', 'image']:
        summary_parts.append(
            f"Visual recording shows approximately {persons_count} individual(s) present within the scene frame."
        )
    elif media_type == 'audio':
        summary_parts.append("Acoustic audio recording captures vocal statements and environmental sound profile.")
    else:
        summary_parts.append("Electronic document uploaded to the evidence vault.")

    # Audio transcription
    if transcript:
        summary_parts.append("Verbal speech detected and transcribed into electronic record.")

    # Metadata
    if metadata and metadata.get("capturedAt"):
        summary_parts.append(f"Recorded metadata indicates capture timestamp: {metadata['capturedAt']}.")
    else:
        summary_parts.append("Timestamp anchored via blockchain block header notarization.")

    # Neutral conclusion
    summary_parts.append("Zero facial identification or biometric attribution has been performed.")

    return " ".join(summary_parts)

def evaluate_completeness(
    media_type: str,
    file_size_bytes: int,
    has_transcript: bool,
    metadata: dict,
    has_location: bool = True
) -> Dict[str, Any]:
    """
    Calculates 0-100% completeness score and missing details checklist.
    Weighted Breakdown:
    - File Integrity & Media Quality: 30 pts
    - Timestamp & EXIF Metadata: 25 pts
    - Spatial / Geolocation Anchoring: 25 pts
    - Corroboration & Speech Clarity: 20 pts
    """
    score = 0
    breakdown = {}
    missing_items = []
    completed_items = []

    # 1. Media Integrity & Resolution (30 pts)
    if file_size_bytes > 5000:
        score += 30
        breakdown["mediaIntegrity"] = 30
        completed_items.append("High-resolution electronic media file preserved")
    else:
        score += 15
        breakdown["mediaIntegrity"] = 15
        missing_items.append("Low file resolution or short media duration")

    # 2. Timestamp & Metadata (25 pts)
    if metadata and metadata.get("capturedAt"):
        score += 25
        breakdown["timestampMetadata"] = 25
        completed_items.append("Original camera EXIF timestamp preserved")
    else:
        score += 15 # partial via blockchain block timestamp
        breakdown["timestampMetadata"] = 15
        missing_items.append("Camera EXIF timestamp missing (anchored via block header only)")

    # 3. Spatial & Geolocation (25 pts)
    if has_location:
        score += 25
        breakdown["geolocation"] = 25
        completed_items.append("Incident geographic coordinates established")
    else:
        breakdown["geolocation"] = 0
        missing_items.append("Specific street intersection or landmark coordinates absent")

    # 4. Speech / Corroboration (20 pts)
    if has_transcript:
        score += 20
        breakdown["transcriptCorroboration"] = 20
        completed_items.append("Acoustic speech transcribed with audible context")
    else:
        score += 8
        breakdown["transcriptCorroboration"] = 8
        missing_items.append("Third-party bystander or secondary witness statements not yet attached")

    explanation = (
        f"Completeness evaluated at {score}/100. "
        f"Media Integrity ({breakdown['mediaIntegrity']}/30), "
        f"Timestamp ({breakdown['timestampMetadata']}/25), "
        f"Geolocation ({breakdown['geolocation']}/25), "
        f"Corroboration ({breakdown['transcriptCorroboration']}/20)."
    )

    return {
        "completenessScore": score,
        "breakdown": breakdown,
        "missingDetails": missing_items,
        "completedDetails": completed_items,
        "explanation": explanation
    }

