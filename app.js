// Messaging Platform App
let currentUser = null;
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentChat = null;
let messages = JSON.parse(localStorage.getItem('messages')) || {};

// Initialize
window.addEventListener('load', () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        loadApp();
    } else {
        showSection('auth');
    }
});

function toggleAuthMode() {
    document.getElementById('loginForm').style.display = 
        document.getElementById('loginForm').style.display === 'none' ? 'flex' : 'none';
    document.getElementById('signupForm').style.display = 
        document.getElementById('signupForm').style.display === 'none' ? 'flex' : 'none';
}

function signup() {
    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;

    if (!username || !password || !confirm) {
        alert('Please fill all fields');
        return;
    }

    if (password !== confirm) {
        alert('Passcodes do not match');
        return;
    }

    if (users.some(u => u.username === username)) {
        alert('Username already exists');
        return;
    }

    const newUser = {
        id: Date.now(),
        username: username,
        password: password
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    loadApp();
}

function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        alert('Please fill all fields');
        return;
    }

    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        alert('Invalid username or passcode');
        return;
    }

    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    loadApp();
}

function logout() {
    currentUser = null;
    currentChat = null;
    localStorage.removeItem('currentUser');
    document.getElementById('auth').classList.add('active');
    document.getElementById('app').classList.remove('active');
    document.getElementById('loginForm').style.display = 'flex';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
}

function loadApp() {
    showSection('app');
    loadContacts();
    loadUsers();
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
}

function loadContacts() {
    const contactsList = document.getElementById('contactsList');
    const userContacts = JSON.parse(localStorage.getItem(`contacts_${currentUser.id}`)) || [];

    contactsList.innerHTML = userContacts.length === 0 ? '<p style="color: #999; font-size: 12px;">No contacts yet</p>' : '';

    userContacts.forEach(contactId => {
        const contact = users.find(u => u.id === contactId);
        if (contact) {
            const div = document.createElement('div');
            div.className = 'user-item' + (currentChat?.id === contact.id ? ' active' : '');
            div.innerHTML = `
                <span onclick="openChat(${contact.id}, '${contact.username}')" style="flex: 1; cursor: pointer;">${contact.username}</span>
                <button class="remove-btn" onclick="removeContact(${contact.id})">Remove</button>
            `;
            contactsList.appendChild(div);
        }
    });
}

function loadUsers() {
    const usersList = document.getElementById('usersList');
    const userContacts = JSON.parse(localStorage.getItem(`contacts_${currentUser.id}`)) || [];
    const otherUsers = users.filter(u => u.id !== currentUser.id && !userContacts.includes(u.id));

    usersList.innerHTML = otherUsers.length === 0 ? '<p style="color: #999; font-size: 12px;">No other users</p>' : '';

    otherUsers.forEach(user => {
        const div = document.createElement('div');
        div.className = 'user-item';
        div.innerHTML = `
            <span>${user.username}</span>
            <button class="add-btn" onclick="addContact(${user.id})">Add</button>
        `;
        usersList.appendChild(div);
    });
}

function searchUsers() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const userContacts = JSON.parse(localStorage.getItem(`contacts_${currentUser.id}`)) || [];
    const otherUsers = users.filter(u => u.id !== currentUser.id && !userContacts.includes(u.id));
    const filtered = otherUsers.filter(u => u.username.toLowerCase().includes(query));

    const usersList = document.getElementById('usersList');
    usersList.innerHTML = filtered.length === 0 ? '<p style="color: #999; font-size: 12px;">No users found</p>' : '';

    filtered.forEach(user => {
        const div = document.createElement('div');
        div.className = 'user-item';
        div.innerHTML = `
            <span>${user.username}</span>
            <button class="add-btn" onclick="addContact(${user.id})">Add</button>
        `;
        usersList.appendChild(div);
    });
}

function addContact(userId) {
    const userContacts = JSON.parse(localStorage.getItem(`contacts_${currentUser.id}`)) || [];
    if (!userContacts.includes(userId)) {
        userContacts.push(userId);
        localStorage.setItem(`contacts_${currentUser.id}`, JSON.stringify(userContacts));
        loadContacts();
        loadUsers();
    }
}

function removeContact(userId) {
    const userContacts = JSON.parse(localStorage.getItem(`contacts_${currentUser.id}`)) || [];
    const index = userContacts.indexOf(userId);
    if (index > -1) {
        userContacts.splice(index, 1);
        localStorage.setItem(`contacts_${currentUser.id}`, JSON.stringify(userContacts));
        if (currentChat?.id === userId) {
            currentChat = null;
            document.getElementById('chatWindow').style.display = 'none';
            document.getElementById('noChatSelected').style.display = 'flex';
        }
        loadContacts();
        loadUsers();
    }
}

function openChat(userId, username) {
    currentChat = { id: userId, username: username };
    document.getElementById('chatUsername').textContent = username;
    document.getElementById('chatWindow').style.display = 'flex';
    document.getElementById('noChatSelected').style.display = 'none';
    document.getElementById('messageInput').value = '';
    loadMessages();
    loadContacts();
}

function loadMessages() {
    const chatKey = [currentUser.id, currentChat.id].sort().join('_');
    const chatMessages = messages[chatKey] || [];
    const messagesList = document.getElementById('messagesList');
    messagesList.innerHTML = '';

    chatMessages.forEach(msg => {
        const div = document.createElement('div');
        div.className = 'message' + (msg.senderId === currentUser.id ? ' own' : ' other');
        div.innerHTML = `
            <div>
                <div class="message-bubble">${msg.text}</div>
                <div class="message-time">${new Date(msg.timestamp).toLocaleTimeString()}</div>
            </div>
        `;
        messagesList.appendChild(div);
    });

    messagesList.scrollTop = messagesList.scrollHeight;
}

function sendMessage() {
    const text = document.getElementById('messageInput').value.trim();
    if (!text) return;

    const chatKey = [currentUser.id, currentChat.id].sort().join('_');
    if (!messages[chatKey]) {
        messages[chatKey] = [];
    }

    messages[chatKey].push({
        senderId: currentUser.id,
        text: text,
        timestamp: new Date().toISOString()
    });

    localStorage.setItem('messages', JSON.stringify(messages));
    document.getElementById('messageInput').value = '';
    loadMessages();
}