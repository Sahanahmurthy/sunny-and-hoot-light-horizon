from reportlab.lib.pagesizes import letter, landscape
from reportlab.pdfgen import canvas
from reportlab.lib import colors
import os

def generate_certificate(
    output_filename="sunny_and_hoot_certificate.pdf",
    recipient_name="Sahana H Murthy",
    template_bg="cert_template.png",
    patches=None,
    suit_img="custom_suit.png"
):
    if patches is None:
        patches = ["patch_artemis.png", "patch_jezero.png", "patch_voyager.png"]

    width, height = landscape(letter) # 792 x 612 points
    c = canvas.Canvas(output_filename, pagesize=landscape(letter))

    # 1. Draw Saatvik's Background Template (if available)
    if os.path.exists(template_bg):
        c.drawImage(template_bg, 0, 0, width=width, height=height)
    else:
        # Fallback dark space background if template isn't added yet
        c.setFillColor(colors.HexColor("#0f172a"))
        c.rect(0, 0, width, height, fill=1)

    # 2. Draw Recipient Name in the Center
    c.setFillColor(colors.HexColor("#facc15")) # Gold text
    c.setFont("Helvetica-Bold", 30)
    c.drawCentredString(width / 2, height * 0.62, recipient_name)

    # 3. Draw Earned Mission Patches on the Left Side
    patch_x = 65
    patch_y_start = height - 180
    patch_size = 85
    for idx, patch_path in enumerate(patches):
        y_pos = patch_y_start - (idx * 110)
        if os.path.exists(patch_path):
            c.drawImage(patch_path, patch_x, y_pos, width=patch_size, height=patch_size, mask='auto')

    # 4. Draw Customized Suit on the Right Side
    if os.path.exists(suit_img):
        c.drawImage(suit_img, width - 210, height * 0.22, width=150, height=280, mask='auto')

    c.save()
    print(f"Certificate saved to {output_filename}")

if __name__ == "__main__":
    generate_certificate()