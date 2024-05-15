from flask import Flask, jsonify, send_from_directory, send_file
import os
from moviepy.editor import VideoFileClip
from PIL import Image

# change this to your own directory with images and video files
app = Flask(__name__, static_folder='C:/directory/static')

def generate_thumbnail(video_path, thumbnail_path):
    clip = VideoFileClip(video_path)
    # extract a frame at the 1-second mark or the first frame if the video is shorter
    frame = clip.get_frame(1 if clip.duration > 1 else 0)
    # save the frame as an image
    img = Image.fromarray(frame.astype('uint8'), 'RGB')
    img.save(thumbnail_path)
    clip.close()

def get_image_urls(directory_path):
    image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    image_urls = []
    directory_path = os.path.join(directory_path, 'images')  # change images to your own directory
    for filename in os.listdir(directory_path):
        if any(filename.lower().endswith(ext) for ext in image_extensions):
            image_url = f"/media/images/{filename}"  # update this line
            image_urls.append(image_url)
    return image_urls

def get_video_urls(directory_path):
    video_extensions = ['.mp4', '.webm', '.ogg']
    video_urls = []
    directory_path = os.path.join(directory_path, 'images')  # change images to your own directory
    thumbnail_dir = os.path.join(directory_path, 'thumbnails')
    if not os.path.exists(thumbnail_dir):
        os.makedirs(thumbnail_dir)

    for filename in os.listdir(directory_path):
        if any(filename.lower().endswith(ext) for ext in video_extensions):
            video_path = os.path.join(directory_path, filename)
            thumbnail_filename = os.path.splitext(filename)[0] + '.jpg'
            thumbnail_path = os.path.join(thumbnail_dir, thumbnail_filename)

            if not os.path.exists(thumbnail_path):
                generate_thumbnail(video_path, thumbnail_path)

            video_url = f"/media/images/{filename}"  # change images to your own directory
            thumbnail_url = f"/media/images/thumbnails/{thumbnail_filename}"  # update this line
            video_urls.append({"video": video_url, "thumbnail": thumbnail_url})

    return video_urls

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/get-images')
def get_images():
    directory_path = app.static_folder
    image_urls = get_image_urls(directory_path)
    return jsonify(image_urls=image_urls)

@app.route('/get-videos')
def get_videos():
    directory_path = app.static_folder
    video_urls = get_video_urls(directory_path)
    return jsonify(video_urls=video_urls)

@app.route('/media/<path:filename>')
def static_files(filename):
    # determine the full path for the requested file
    full_path = os.path.join(app.static_folder, filename)
    # check if the requested file exists in the static folder or its subdirectories
    if os.path.exists(full_path):
        return send_file(full_path, as_attachment=True, conditional=True)
    else:
        # attempt to serve from the thumbnails directory
        thumbnail_path = os.path.join(app.static_folder, 'thumbnails', filename)
        if os.path.exists(thumbnail_path):
            return send_file(thumbnail_path, as_attachment=True, conditional=True)
    # return 404 if the file is not found in either location
    return "File not found", 404

if __name__ == '__main__':
    app.run(debug=True)
