document.addEventListener('DOMContentLoaded', function() {
    
    let currentUserData = null; // Store user data globally on this page

    // --- Modal Handling ---
    const editProfileModal = document.getElementById('editProfileModal');
    const addressModal = document.getElementById('addressModal');
    
    // Generic function to close any modal
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.onclick = () => {
            btn.closest('.auth-modal').style.display = 'none';
        }
    });

    // --- Event Listeners ---
    document.getElementById('editProfileForm').addEventListener('submit', handleProfileUpdate);
    document.getElementById('addressForm').addEventListener('submit', handleAddressUpdate);
    document.getElementById('addNewAddressBtn').addEventListener('click', () => {
        // Rule: Check if user has less than 3 addresses
        if (currentUserData && currentUserData.addresses.length >= 3) {
            alert("You can only have a maximum of 3 saved addresses.");
            return;
        }
        openAddressModal(); // Open modal for adding
    });
    
    // --- Main Function to Fetch User Info and User Addresses Data ---
    async function fetchProfileData() {
        try {
            const response = await fetch('/customer/my-profile');
            if (!response.ok) {
                if (response.status === 401) window.location.href = '../index.html';
                else throw new Error('Could not load profile.');
            }
            const data = await response.json();
            currentUserData = data; // Store the fetched data
            renderUserDetails(data.user);
            renderAddresses(data.addresses);
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }

    // function to get user details details and print 
    function renderUserDetails(user) {
        const container = document.getElementById('userDetails');
        container.innerHTML = `
            <div class="detail-group"><label>Full Name</label><p>${user.fullName}</p></div>
            <div class="detail-group"><label>Email Address</label><p>${user.email}</p></div>
            <div class="detail-group"><label>Mobile Number</label><p>${user.mobileNumber}</p></div>
            <button class="btn-edit-details">Edit Details</button>
        `;
        container.querySelector('.btn-edit-details').onclick = () => {
            document.getElementById('editFullName').value = user.fullName;  // it stores the input values of edit form into user values
            document.getElementById('editEmail').value = user.email;
            editProfileModal.style.display = 'flex';
        };
    }

    function renderAddresses(addresses) {
        const container = document.getElementById('addressList');
        container.innerHTML = '';
        if (!addresses || addresses.length === 0) {
            container.innerHTML = '<p>You have no saved addresses.</p>';
            return;
        }
        addresses.forEach(addr => {
            const card = document.createElement('div');
            card.className = 'address-card';
            card.innerHTML = `
                <p><strong>${addr.fullName}</strong><br>${addr.addressLine1}, ${addr.addressLine2 || ''}<br>${addr.city}, ${addr.state} - ${addr.pincode}<br>Mobile: ${addr.mobileNumber}</p>
                <div class="address-actions">
                    <button class="btn-link btn-edit" data-id="${addr.addressId}">Edit</button>
                    <button class="btn-link btn-delete" data-id="${addr.addressId}">Delete</button>
                </div>
            `;
            container.appendChild(card);
        });

        // Adding  event listeners to the edit/delete  buttons to open edit form and delete address
        container.querySelectorAll('.btn-edit').forEach(btn => btn.onclick = () => openAddressModal(btn.dataset.id));
        container.querySelectorAll('.btn-delete').forEach(btn => btn.onclick = () => deleteAddress(btn.dataset.id));
    }

    // --- Action Functions ---
    function openAddressModal(addressId = null) {
        const form = document.getElementById('addressForm');
        form.reset(); // Clear previous data
        const title = document.getElementById('addressModalTitle');

        if (addressId) { // Editing existing address
            title.textContent = 'Edit Address';
            document.getElementById('addressAction').value = 'update';
            const address = currentUserData.addresses.find(a => a.addressId == addressId);
            if (address) {
                document.getElementById('addressId').value = address.addressId;
                document.getElementById('fullName').value = address.fullName;
                document.getElementById('mobileNumber').value = address.mobileNumber;
                document.getElementById('addressLine1').value = address.addressLine1;
                document.getElementById('addressLine2').value = address.addressLine2 || '';
                document.getElementById('city').value = address.city;
                document.getElementById('pincode').value = address.pincode;
                document.getElementById('state').value = address.state;
            }
        } else { // Adding new address
            title.textContent = 'Add New Address';
            document.getElementById('addressAction').value = 'add';
        }
        addressModal.style.display = 'flex';
    }

    async function handleProfileUpdate(e) {
        e.preventDefault();
        const response = await fetch('/update-profile', {
            method: 'POST',
            body: new URLSearchParams(new FormData(e.target))
        });
        if (response.ok) {
            alert("Profile updated!");
            editProfileModal.style.display = 'none';
            fetchProfileData(); // Refresh data on page
        } else {
            alert("Failed to update profile.");
        }
    }

    async function handleAddressUpdate(e) {
        e.preventDefault();
        const response = await fetch('/address-manager', {
            method: 'POST',
            body: new URLSearchParams(new FormData(e.target))
        });
        const result = await response.json();
        if (result.success) {
            alert(result.message);
            addressModal.style.display = 'none';
            fetchProfileData(); // Refresh data on page
        } else {
            alert(`Error: ${result.message}`);
        }
    }

    async function deleteAddress(addressId) {
        if (!confirm("Are you sure you want to delete this address?")) return;
        const response = await fetch(`/address-manager?id=${addressId}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (result.success) {
            alert(result.message);
            fetchProfileData(); // Refresh data on page
        } else {
            alert(`Error: ${result.message}`);
        }
    }
    
    fetchProfileData(); // Initial load
});