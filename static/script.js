const images = Array.from(document.querySelectorAll('.image-grid img')).map(img => {
    return {
      el: img,
      aspectRatio: img.naturalWidth / img.naturalHeight
    };
  });

  const videos = Array.from(document.querySelectorAll('.video-grid video')).map(video => {
    return {
      el: video,
      aspectRatio: video.videoWidth / video.videoHeight
    };
  });

  document.addEventListener("DOMContentLoaded", function () {
    const imageGrid = document.querySelector('.image-grid');
    const videoGrid = document.querySelector('.video-grid');

    document.getElementById('loadImages').addEventListener('click', function () {
      // clear the video grid
      while (videoGrid.firstChild) {
        videoGrid.removeChild(videoGrid.firstChild);
      }
      fetchImages();
      loadImage();
    });

    document.getElementById('loadVideos').addEventListener('click', function () {
      // clear the image grid
      while (imageGrid.firstChild) {
        imageGrid.removeChild(imageGrid.firstChild);
      }
      fetchVideos();
      loadVideo();
    });

    let observer;

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const item = entry.target;
            // for images
            if (item.tagName === 'IMG') {
              item.src = item.dataset.src;
            }
            // for videos
            if (item.tagName === 'VIDEO') {
              item.src = item.querySelector('source').src;
            }
            observer.unobserve(item); // stop observing the item since it's already loaded
          }
        });
      }, { rootMargin: '0px 0px 256px 0px' }); // adjust rootMargin as needed
    }

    // check if a response is in the cache, and if not, fetch it from the network
    function fetchAndCacheImage(img, url) {
      // check for the image in the cache
      caches.open('image-cache').then(cache => {
        cache.match(url).then(response => {
          if (response) {
            // if the image is found in the cache, use it
            response.blob().then(blob => {
              img.src = URL.createObjectURL(blob);
            });
          } else {
            // if the image is not found in the cache, fetch from network and cache it
            fetch(url).then(response => {
              if (!response.ok) throw new Error(`Network response was not ok for ${url}`);
              cache.put(url, response.clone()); // clone the response to not consume it
              response.blob().then(blob => {
                img.src = URL.createObjectURL(blob);
              });
            }).catch(error => console.error('Fetching and caching image failed:', error));
          }
        });
      });
    }

    function fetchAndCacheVideo(video, url) {
      // check for the video in the cache
      caches.open('video-cache').then(cache => {
        cache.match(url).then(response => {
          if (response) {
            // if the video is found in the cache, use it
            response.blob().then(blob => {
              video.src = URL.createObjectURL(blob);
            });
          } else {
            // if the video is not found in the cache, fetch from network and cache it
            fetch(url).then(response => {
              if (!response.ok) throw new Error(`Network response was not ok for ${url}`);
              cache.put(url, response.clone()); // clone the response to not consume it
              response.blob().then(blob => {
                video.src = URL.createObjectURL(blob);
              });
            }).catch(error => console.error('Fetching and caching video failed:', error));
          }
        });
      });
    }

    let currentPage = 0;
    const imagesPerPage = 20;
    // fetch images from the server
    function fetchImages() {
      fetch(`/get-images?page=${currentPage}&limit=${imagesPerPage}`)
        .then(response => response.json())
        .then(data => {
          const imageUrls = data.image_urls;
          imageUrls.forEach(url => {
            const imgDiv = document.createElement('div');
            imgDiv.className = 'image-item';

            const img = document.createElement('img');
            img.dataset.src = url;
            observer.observe(img); // keep the 'lazy' class for lazy loading

            // use fetchAndCacheImage function to load images
            fetchAndCacheImage(img, url);

            img.onload = () => adjustImagePlacement(img);

            imgDiv.appendChild(img);
            imageGrid.appendChild(imgDiv);
          });
          currentPage++;
        }).catch(error => console.error('Error fetching images:', error));
    }

    // adjusts image placement based on its height
    function adjustImagePlacement(img) {
      const rowHeight = parseInt(window.getComputedStyle(imageGrid).getPropertyValue('grid-auto-rows'));
      const gap = parseInt(window.getComputedStyle(imageGrid).getPropertyValue('grid-gap'));
      const rowSpan = Math.ceil((img.offsetHeight + gap) / (rowHeight + gap));
      img.parentElement.style.gridRowEnd = 'span ' + rowSpan;
    }

    function adjustVideoPlacement(video) {
      const rowHeight = parseInt(window.getComputedStyle(videoGrid).getPropertyValue('grid-auto-rows'));
      const gap = parseInt(window.getComputedStyle(videoGrid).getPropertyValue('grid-gap'));
      const rowSpan = Math.ceil((video.offsetHeight + gap) / (rowHeight + gap));
      video.parentElement.style.gridRowEnd = 'span ' + rowSpan;
    }

    // function to load an image
    function loadImage(img) {
      // check if the image is in the cache
      window.imageCache.match(img.src).then(response => {
        if (response) {
          // if the image is in the cache, use it
          img.src = URL.createObjectURL(response);
        } else {
          // if the image is not in the cache, fetch it and add it to the cache
          fetch(img.src).then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            window.imageCache.put(img.src, response.clone());
            return response.blob();
          }).then(blob => {
            img.src = URL.createObjectURL(blob);
          }).catch(error => {
            console.error('Error loading image:', error);
          });
        }
      });
    }

    function fetchVideos() {
      fetch('/get-videos')
        .then(response => response.json())
        .then(data => {
          const videoData = data.video_urls;
          videoData.forEach(item => {
            const videoDiv = document.createElement('div');
            videoDiv.className = 'video-item';

            const video = document.createElement('video');
            video.controls = true;
            video.className = 'w-full h-auto object-cover'; // adjusted className
            video.preload = 'metadata'; // preload metadata to get dimensions
            video.poster = item.thumbnail; // set the poster

            // append the source for the video
            const source = document.createElement('source');
            source.src = item.video; // set the src attribute
            video.appendChild(source);
            video.poster = item.thumbnail; // set the poster

            videoDiv.appendChild(video);
            imageGrid.appendChild(videoDiv);

            observer.observe(video);

            // listen for when metadata has loaded to adjust layout
            video.addEventListener('loadedmetadata', () => {
              adjustVideoPlacement(video);
            });
          });
        }).catch(error => console.error('Error fetching videos:', error));
    }

    function loadVideo(video) {

      const source = video.querySelector('source');
      const src = source.src;
      // check if the video is in the cache
      caches.open('video-cache').then(cache => {
        cache.match(video.src).then(response => {
          if (response) {
            // if the video is in the cache, use it
            video.src = URL.createObjectURL(response);
          } else {
            // if the video is not in the cache, fetch it and add it to the cache
            fetch(video.src).then(response => {
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              window.videoCache.put(video.src, response.clone());
              return response.blob();
            }).then(blob => {
              video.src = URL.createObjectURL(blob);
            }).catch(error => {
              console.error('Error loading video:', error);
            });
          }
        });
      });
    }

    // function to initialize lazy loading
    function initializeLazyLoading() {
      const images = document.querySelectorAll('.image-grid img.lazy');
      const videos = document.querySelectorAll('.video-grid video.lazy');

      // if we don't have support for intersection observer, loads the images immediately
      if (!('IntersectionObserver' in window)) {
        images.forEach(img => {
          loadImage(img);
        });
        videos.forEach(video => {
          loadVideo(video);
        });
        return;
      }

      // IntersectionObserver to lazy load images + videos
      let observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            let video = entry.target;
            let img = entry.target;
            loadImage(img);
            loadVideo(video);
            img.classList.remove('lazy');
            video.classList.remove('lazy');
            observer.unobserve(img);
            observer.unobserve(video);
          }
        });
      }, { rootMargin: '0px 0px 256px 0px' });


      images.forEach(img => {
        observer.observe(img);
      });

      // same observer for videos and imgs
      videos.forEach(video => {
        observer.observe(video);
      });


    }

    // this function calculates and sets the row span for an image
    const setRowSpan = (img) => {
      const rowHeight = parseInt(window.getComputedStyle(imageGrid).getPropertyValue('grid-auto-rows'));
      const gap = parseInt(window.getComputedStyle(imageGrid).getPropertyValue('grid-gap'));
      const rowSpan = Math.ceil((img.clientHeight + gap) / (rowHeight + gap));
      img.parentElement.style.gridRowEnd = `span ${rowSpan}`;
    };

    const setRowSpanVideo = (video) => {
      const rowHeight = parseInt(window.getComputedStyle(imageGrid).getPropertyValue('grid-auto-rows'));
      const gap = parseInt(window.getComputedStyle(imageGrid).getPropertyValue('grid-gap'));
      const rowSpan = Math.ceil((video.clientHeight + gap) / (rowHeight + gap));
      video.parentElement.style.gridRowEnd = `span ${rowSpan}`;
    };


    // function to initialize row spans
    const initializeMasonry = () => {
      const images = document.querySelectorAll('.image-grid img');
      const videos = document.querySelectorAll('.image-grid video');

      images.forEach(img => {
        img.onload = () => {
          setRowSpan(img);
        };
        // if the image is already loaded (cached), we set the row span immediately
        if (img.complete) {
          setRowSpan(img);
        }
      });

      videos.forEach(video => {
        const resizeObserver = new ResizeObserver(() => {
          setRowSpanVideo(video);
        });
        resizeObserver.observe(video);
      });
    };



    document.addEventListener('click', function (e) {
      if (e.target.tagName === 'IMG') {
        const modal = document.createElement('div');
        const originalHeight = e.target.naturalHeight;
        const height90Percent = originalHeight * 0.8;
        modal.innerHTML = `<div class="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 flex justify-center items-center">
    <img src="${e.target.src}" alt="Modal Image" style="max-height: ${height90Percent}px; max-width: 100%;" class="zoomable">
  </div>`;
        modal.addEventListener('click', function () {
          modal.remove();
        });
        document.body.appendChild(modal);

        const zoomableImage = modal.querySelector('.zoomable');
        let scale = 1;
        zoomableImage.addEventListener('wheel', function (event) {
          event.preventDefault();
          event.stopPropagation();
          const rect = zoomableImage.getBoundingClientRect();
          const x = (event.clientX - rect.left) / scale; //x position within the element.
          const y = (event.clientY - rect.top) / scale;  //y position within the element.
          zoomableImage.style.transformOrigin = `${x}px ${y}px`;
          scale += event.deltaY * -0.001;  // use a smaller multiplier for a smoother zoom
          scale = Math.min(Math.max(.125, scale), 4); // restrict scale between 0.125 and 4
          zoomableImage.style.transform = `scale(${scale})`;
        });

        zoomableImage.addEventListener('click', function (event) {
          event.stopPropagation();  // prevent the click event from bubbling up to the modal
          scale = 1;  // reset the scale
          zoomableImage.style.transform = `scale(${scale})`;
        });
      }
    });

    // listener to check if window was resized, if so, reinitialize masonry layout
    window.addEventListener('resize', initializeMasonry);

    // listener to check if window was scrolled, if so, reinitialize masonry layout
    window.addEventListener('scroll', initializeMasonry);



  });