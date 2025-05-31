document.addEventListener("DOMContentLoaded", function() {
    // This is an empty script file.
    // All button functionality has been removed as requested
    
    // Settings dropdown toggle
    const settingsIcon = document.getElementById("settingsIcon");
    const settingsPanel = document.getElementById("settingsPanel");
    
    if (settingsIcon && settingsPanel) {
        settingsIcon.addEventListener("click", function(e) {
            e.stopPropagation();
            settingsPanel.classList.toggle("visible");
        });
        
        // Close dropdown when clicking elsewhere
        document.addEventListener("click", function(e) {
            if (settingsIcon && !settingsIcon.contains(e.target)) {
                settingsPanel.classList.remove("visible");
            }
        });
    }
    
    // Add event listeners for the new dropdown options
    const updateProfilePicBtn = document.getElementById("updateprofilepic_button");
    if (updateProfilePicBtn) {
        updateProfilePicBtn.addEventListener("click", function(e) {
            e.preventDefault();
            // Show profile picture update modal
            showModal("updateprofilepicUI");
        });
    }
    
    // Handle file selection and display file name
    const profilePicInput = document.getElementById("profile_pic_input");
    if (profilePicInput) {
        profilePicInput.addEventListener("change", function() {
            const fileName = this.files[0] ? this.files[0].name : "No file chosen";
            document.getElementById("file-name").textContent = fileName;
            
            // Show image preview
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById("profile_pic_preview").src = e.target.result;
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
    
    const editAccountBtn = document.getElementById("editaccount_button");
    if (editAccountBtn) {
        editAccountBtn.addEventListener("click", function(e) {
            e.preventDefault();
            // Show account info modal
            showModal("editaccountUI");
            
            // Load user account info
            fetch("/backend/admin/get_user_account_info")
                .then(response => response.json())
                .then(data => {
                    if (data.error) return console.error(data.error);
                    
                    // Set values
                    document.getElementById("username_txt").value = data.username || 'Admin';
                    document.getElementById("firstname_txt").value = data.first_name || '';
                    document.getElementById("middlename_txt").value = data.middle_name || '';
                    document.getElementById("lastname_txt").value = data.last_name || '';
                    document.getElementById("position_txt").value = data.position_name || 'Administrator';
                    document.getElementById("email_txt").value = data.email || '';
                    document.getElementById("contactnumber_txt").value = data.contact_number || '';
                    
                    // Initially all fields are disabled until Edit button is clicked
                    document.querySelectorAll("#editaccountUI input").forEach(input => {
                        input.disabled = true;
                        input.classList.add("custom-disabled");
                    });
                })
                .catch(error => console.error("Error fetching account info:", error));
        });
    }
    
    const changePasswordBtn = document.getElementById("changepassword_button");
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener("click", function(e) {
            e.preventDefault();
            // Show change password modal
            showModal("updatepasswordUI");
        });
    }
    
    // Add Edit Account button functionality
    const editUpdateBtn = document.getElementById("editupdate");
    if (editUpdateBtn) {
        editUpdateBtn.addEventListener("click", function() {
            const isEditable = editUpdateBtn.textContent === "Edit Account";
            
            // Toggle input fields disabled state (including username and position)
            const inputFields = document.querySelectorAll("#editaccountUI input");
            inputFields.forEach(input => {
                input.disabled = !isEditable;
                if (!isEditable) {
                    input.classList.add("custom-disabled");
                } else {
                    input.classList.remove("custom-disabled");
                }
            });
            
            // Toggle cancel button visibility
            document.getElementById("cancelBtn").style.display = isEditable ? "inline-block" : "none";
            
            if (isEditable) {
                // Enable editing
                editUpdateBtn.textContent = "Save Changes";
                editUpdateBtn.classList.add("save-btn");
                editUpdateBtn.classList.remove("enablesave-btn");
            } else {
                // Save changes
                const firstName = document.getElementById("firstname_txt").value;
                const middleName = document.getElementById("middlename_txt").value;
                const lastName = document.getElementById("lastname_txt").value;
                const email = document.getElementById("email_txt").value;
                const contactNumber = document.getElementById("contactnumber_txt").value;
                
                fetch("/backend/admin/update_account_info", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        first_name: firstName,
                        middle_name: middleName,
                        last_name: lastName,
                        email: email,
                        contact_number: contactNumber
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert("Account information updated successfully.");
                        // Reset button state
                        editUpdateBtn.textContent = "Edit Account";
                        editUpdateBtn.classList.remove("save-btn");
                        editUpdateBtn.classList.add("enablesave-btn");
                        // Disable inputs again
                        inputFields.forEach(input => {
                            input.disabled = true;
                        });
                        document.getElementById("cancelBtn").style.display = "none";
                    } else {
                        alert("Failed to update account information: " + (data.message || "Unknown error."));
                    }
                })
                .catch(error => {
                    console.error("Error updating account info:", error);
                    alert("An error occurred while updating account information.");
                });
            }
        });
    }
    
    // Cancel button functionality
    const cancelBtn = document.getElementById("cancelBtn");
    if (cancelBtn) {
        cancelBtn.addEventListener("click", function() {
            // Reload original account info
            fetch("/backend/admin/get_user_account_info")
                .then(response => response.json())
                .then(data => {
                    if (data.error) return console.error(data.error);
                    document.getElementById("firstname_txt").value = data.first_name || '';
                    document.getElementById("middlename_txt").value = data.middle_name || '';
                    document.getElementById("lastname_txt").value = data.last_name || '';
                    document.getElementById("email_txt").value = data.email || '';
                    document.getElementById("contactnumber_txt").value = data.contact_number || '';
                    
                    // Reset form state
                    const inputFields = document.querySelectorAll("#editaccountUI input");
                    inputFields.forEach(input => {
                        input.disabled = true;
                        input.classList.add("custom-disabled");
                    });
                    
                    // Ensure username and position remain disabled
                    document.getElementById("username_txt").disabled = true;
                    document.getElementById("position_txt").disabled = true;
                    
                    const editUpdateBtn = document.getElementById("editupdate");
                    editUpdateBtn.textContent = "Edit Account";
                    editUpdateBtn.classList.remove("save-btn");
                    editUpdateBtn.classList.add("enablesave-btn");
                    
                    document.getElementById("cancelBtn").style.display = "none";
                })
                .catch(error => console.error("Error fetching account info:", error));
        });
    }
    
    // Close buttons for modals
    const closeButtons = document.querySelectorAll(".close-btn");
    closeButtons.forEach(button => {
        button.addEventListener("click", function() {
            hideAllModals();
        });
    });
    
    // Overlay click should close modals
    const overlay = document.getElementById("overlay");
    if (overlay) {
        overlay.addEventListener("click", function() {
            hideAllModals();
        });
    }
    
    // Password validation
    const newPasswordInput = document.getElementById("updatepassword_admin");
    if (newPasswordInput) {
        newPasswordInput.addEventListener("input", function() {
            const password = this.value;
            
            document.getElementById("lengthRule").textContent = (password.length >= 8 && password.length <= 12) 
                ? "✅ 8–12 characters" : "❌ 8–12 characters";
            
            document.getElementById("uppercaseRule").textContent = /[A-Z]/.test(password) 
                ? "✅ At least one uppercase letter" : "❌ At least one uppercase letter";
            
            document.getElementById("lowercaseRule").textContent = /[a-z]/.test(password) 
                ? "✅ At least one lowercase letter" : "❌ At least one lowercase letter";
            
            document.getElementById("numberRule").textContent = /\d/.test(password) 
                ? "✅ At least one number" : "❌ At least one number";
            
            document.getElementById("specialCharRule").textContent = /[\W_]/.test(password) 
                ? "✅ At least one special character" : "❌ At least one special character";
        });
    }
    
    // Update password button
    const updatePasswordBtn = document.getElementById("updatepassword_btn");
    if (updatePasswordBtn) {
        updatePasswordBtn.addEventListener("click", async function() {
            const oldPassword = document.getElementById("old_password_txt").value;
            const newPassword = document.getElementById("updatepassword_admin").value;
            
            const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,12}$/;
            if (!passwordPattern.test(newPassword)) {
                alert("Password must be 8–12 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.");
                return;
            }
            
            try {
                const response = await fetch("/backend/admin/change_password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        old_password: oldPassword,
                        new_password: newPassword
                    }),
                });
                const data = await response.json();
                if (response.ok) {
                    alert("Password updated successfully!");
                    hideAllModals();
                } else {
                    alert("Error: " + (data.message || "Failed to update password"));
                }
            } catch (error) {
                console.error(error);
                alert("An error occurred during password change.");
            }
        });
    }
    
    // Profile picture update
    const profilePicForm = document.getElementById("updateprofilepic_form");
    if (profilePicForm) {
        profilePicForm.addEventListener("submit", function(e) {
            e.preventDefault();
            
            const fileInput = document.getElementById("profile_pic_input");
            console.log("File input element found:", fileInput);
            console.log("Files property:", fileInput.files);
            
            const file = fileInput.files[0];
            
            if (!file) {
                alert("Please select an image.");
                return;
            }
            
            console.log("File selected:", file.name, "Size:", file.size, "Type:", file.type);
            
            const formData = new FormData();
            formData.append("profile_pic", file, file.name); // Add filename explicitly
            console.log("FormData created with file");
            
            fetch("/backend/admin/update_profile_picture", {
                method: "POST",
                body: formData,
                credentials: 'same-origin'
            })
            .then(async response => {
                const data = await response.json();
                if (response.ok) {
                    alert("Profile picture updated!");
                    location.reload();  // Refresh the page to show new picture
                } else {
                    alert("Failed: " + (data.error || "Unknown error."));
                }
            })
            .catch(error => {
                console.error("Error uploading profile picture:", error);
                alert("An error occurred while uploading.");
            });
        });
    }
});

// Helper function to show modals
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById("overlay");
    
    if (modal && overlay) {
        modal.style.display = "block";
        overlay.style.display = "block";
    }
}

// Helper function to hide all modals
function hideAllModals() {
    const modals = document.querySelectorAll(".floating-ui");
    const overlay = document.getElementById("overlay");
    
    modals.forEach(modal => {
        modal.style.display = "none";
    });
    
    if (overlay) {
        overlay.style.display = "none";
    }
}
