

// // To add image preview for the selected image

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




