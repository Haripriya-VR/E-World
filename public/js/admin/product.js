

// To add image preview for the selected image

function getImagePreview(event,previewId) {
    const image = URL.createObjectURL(event.target.files[0]);
    const previewContainer = document.getElementById(previewId);
    const newimg =document.createElement('img');
    // Remove existing preview images
    previewContainer.innerHTML = '';

    // create new preview image
    newimg.src = image
    newimg.width='50'
    newimg.height ='50'
    

     // Append the new preview image to the container
     previewContainer.appendChild(newimg);

}
// ========================================================================================

// let cropper;

// function getImagePreview(event, previewId) {
//   const image = URL.createObjectURL(event.target.files[0]);
//   const previewContainer = document.getElementById(previewId);
//   const newimg = document.createElement('img');
//   newimg.src = image;
//   newimg.width = '50';
//   newimg.height = '50';

//   // Remove existing preview images
//   previewContainer.innerHTML = '';

//   // Append the new preview image to the container
//   previewContainer.appendChild(newimg);

//   // Add click event listener to the preview image for opening a larger view
//   newimg.addEventListener('click', function () {
//     openLargePreview(image,previewContainer);
//   });
// }

// function openLargePreview(imageSrc,previewContainer) {
//   const largePreview = document.getElementById('largePreview');
//   const cropperImage = document.getElementById('cropperImage');
//   console.log('preview container',previewContainer);
//   // Set the source of the large image
//   cropperImage.src = imageSrc;

//   // Set the size to 500px
//   cropperImage.style.width = '500px';
//   cropperImage.style.height = '500px';

//   // Display the large preview
//   largePreview.style.display = 'flex';

//   cropper = new Cropper(cropperImage, {
//     aspectRatio: 1, 
//     viewMode: 2, 
//   });

//   // Add event listener to the crop button
//   document.getElementById('cropButton').addEventListener('click', function () {
    
//     const croppedDataUrl = cropper.getCroppedCanvas().toDataURL();
    
//     // const previewContainer = document.getElementById(previewId);

//     if (!previewContainer) {
//        console.log('Preview container not found');
//         return;
//       }

//      const previewImage =document.createElement('img');
//      previewImage.src = croppedDataUrl;
//      previewImage.width = '50';
//      previewImage.height = '50';
//      previewContainer.innerHTML = '';

//     previewContainer.appendChild(previewImage);

//     // Destroy the Cropper instance
//     cropper.destroy();
    
//     // Hide the large preview
//     largePreview.style.display = 'none';
//   });
// }
// // ====================================================================



