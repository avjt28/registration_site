// Execute when document loads
$(document).ready(() => {
    $("#loadingListStatus").hide() // Hide the process ongoing indicator in the navbar
    console.log("Ready!")

    const db = firebase.firestore(); //
    const storageRef = firebase.storage().ref();
    const userDB = db.collection("users")

    addUser = () => {
        // Show the process spinner
        $("#loadingListStatus").show()

        // get jQuery node references to form elements
        let name = $("#nameData"),
            rollno = $("#rollnoData"),
            phno = $("#phnoData");

        let imgToUpload = $("#imgToUpload")[0].files[0]; // Get reference to file to be uploaded

        // Check if the the fields are not empty
        if (!!name.val() && !!rollno.val() && !!phno.val() && $("#imgToUpload")[0].files.length > 0) {

            // Firebase API call
            userDB.add({ name: name.val(), phno: phno.val(), rollno: rollno.val(), })
                .then((userRef) => {
                    // If data submits successfully, attempt to upload image with the same ref id
                    let imgRef = storageRef.child(`users/${userRef.id}`)
                    imgRef.put(imgToUpload).then(snapshot => {
                        console.log("Image uploaded successfully!", snapshot)
                    }).catch(err => {
                        console.log("Image had issues uploading.", err)
                    })
                    alert("User added successfully!");

                    // Empty form fields for new entry
                    name.val("");
                    rollno.val("");
                    phno.val("");

                    // Hide the process spinner
                    $("#loadingListStatus").hide()

                    // Refresh the list of users to update for the new entry
                    listUsers();
                })
                .catch((error) => {
                    $("#loadingListStatus").hide();
                    console.log(error);
                    alert("There was an error in creating user. Please try again after a while.");
                })
        } else {
            $("#loadingListStatus").hide();
            // Tell the user to complete the form
            alert(`The following fields are empty: ${name.val() ? "" : "Name"}${rollno.val() ? "" : ", Roll Number"}` +
                `${phno.val() ? "" : ", Phone Number"}${$("#imgToUpload")[0].files.length > 0 ? "" : ", Picture"}. Please fill them properly.`)
        }
        return false;
    }

    listUsers = () => {
        // Show the process spinner
        $("#loadingListStatus").show()
        let list = []

        // Empty the user list table 
        $('#listUserContainer').empty();

        // Firebase API call
        userDB.get().then(query => {
            // Map through the query result and append data into the list array
            query.forEach((doc, i) => {
                list.push({ ...doc.data(), id: doc.id })
            })

            // Append HTML elements onto the table
            // - The image url needs to be fetched asynchronously
            list.map((data, i) => $('#listUserContainer').append($(
                `<tr><td>${i + 1}</td>
                <td>${data.name}</td>
                <td>${data.phno}</td>
                <td>${data.rollno}</td>
                <td id="td-${data.id}"><button class="btn btn-link" onclick="fetchImgUrl('${data.id}')">Fetch</button></td></tr>`)))
            $("#loadingListStatus").hide();
        })
    }

    fetchImgUrl = (id) => {
        // Empty the cell
        $(`#td-${id}`).empty();
        // Append a process spinner
        $(`#td-${id}`).append($(`<div class="spinner-border"></div>`))

        // Attempt to fetch the url of an image with the same ID as the data
        storageRef.child(`users/${id}`).getDownloadURL()
            .then(url => {
                $(`#td-${id}`).empty();
                // Append a link to open the image in a new tab(target="_blank" opens in a new tab)
                $(`#td-${id}`).append($(`<a class="btn btn-link" href="${url}" target="_blank">Open Image</a>`))
            })
            .catch(err => {
                alert("An error has occured. Please try again later");
                console.log(err);
                // Show an error box
                $(`#td-${id}`).empty();
                $(`#td-${id}`).append($(`<div class="btn btn-danger">Error retrieving image</div>`))
            })
    }
})

