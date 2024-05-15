# **ImageFleet**

**ImageFleet** is a dynamic media gallery application built using Flask and JavaScript, designed to serve, display, and manage images and videos efficiently. The application features responsive masonry layouts for media files, supports lazy loading, and provides an enhanced interactive user experience with modal image viewing and on-demand video playback.

![ImageFleet Example](https://i.imgur.com/WHI3r0w.png "Example Image")

## **Features**

### **Dynamic Media Gallery**
- Serve images and videos from specified directories dynamically, updating the content as new files are added without needing a restart.
- Thumbnails for videos are automatically generated to improve the browsing experience.

### **Responsive Masonry Layout**
- Utilizes CSS Grid to create a flexible and visually appealing layout that adjusts according to screen size and orientation.
- Dynamic adjustment of grid row spans based on content size ensures a seamless presentation without gaps.

### **Lazy Loading**
- Implements lazy loading for images and videos, optimizing load times and reducing bandwidth usage.
- Uses the Intersection Observer API to load content only when it enters the viewport.

### **Enhanced Interactivity**
- Clickable images open in a modal with zoom functionality, providing a detailed view.
- Smooth transitions and hover effects enhance the user interface.

### **Caching for Performance**
- Media files are cached in the browser to provide faster subsequent access and improve user experience.
- Progressive loading and caching strategies ensure that the application is responsive and efficient.

### **Built With**
- **Flask** - A lightweight WSGI web application framework.
- **JavaScript** - For asynchronous data fetching, DOM manipulation, and client-side scripting.
- **Tailwind CSS** - For styling and responsive design.
- **moviepy** - To handle video processing tasks like thumbnail generation.
- **Pillow (PIL Fork)** - Used for image processing operations.
- **HTML5** and **CSS3** - For markup and styling.

## **Getting Started**

### **Prerequisites**
- Python 3.6+
- Pip

### **Installation**

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/imagefleet.git
   ```
   ```bash
   cd imagefleet
   ```
   
2. **Set up a virtual environment (optional but recommended):**
   ```bash
   python -m venv venv
   ```
   ```bash
   source venv/bin/activate # On Windows use venv\Scripts\activate
   ```
   
4. **Install dependencies:**
   ```bash
   pip install Flask moviepy Pillow
   ```

6. **Start the server:**
   ```bash
   python app.py
   ```

8. **Visit the application:**
Open `http://127.0.0.1:5000/` in your web browser.

## **Usage**

- **Loading Content:** Use the 'Load Images' and 'Load Videos' buttons in the user interface to dynamically load and display new media files.
- **View and Interact:** Click on any image to view it in a zoomable modal. Videos can be played directly in the browser with controls.


   
