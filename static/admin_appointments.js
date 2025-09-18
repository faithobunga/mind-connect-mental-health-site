// =============================================================================
// ADMIN APPOINTMENTS MANAGEMENT - JAVASCRIPT
// File: static/admin_appointments.js
// =============================================================================

// Global variables
let appointments = [];
let counselors = [];
let currentAppointmentId = null;
let confirmAction = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Initializing admin appointments page...');
    loadAppointments();
    loadCounselors();
    setupEventListeners();
});

// =============================================================================
// EVENT LISTENERS
// =============================================================================

function setupEventListeners() {
    // Mode selection change
    document.querySelectorAll('input[name="mode"]').forEach(radio => {
        radio.addEventListener('change', updateLocationField);
    });

    // Counselor selection
    document.addEventListener('change', function(e) {
        if (e.target.type === 'radio' && e.target.name === 'counselor_id') {
            updateCounselorSelection(e.target);
        }
    });

    // Mode selection
    document.addEventListener('change', function(e) {
        if (e.target.type === 'radio' && e.target.name === 'mode') {
            updateModeSelection(e.target);
        }
    });

    // Close modal when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
}

// =============================================================================
// DATA LOADING FUNCTIONS
// =============================================================================

async function loadAppointments() {
    try {
        showLoading(true);
        
        const response = await fetch('/api/admin/appointments/list');
        const data = await response.json();
        
        if (data.success) {
            appointments = data.appointments;
            renderAppointmentsTable();
            updateStatistics();
        } else {
            showAlert('Error loading appointments: ' + data.message, 'danger');
        }
    } catch (error) {
        console.error('Error loading appointments:', error);
        showAlert('Failed to load appointments. Please refresh the page.', 'danger');
    } finally {
        showLoading(false);
    }
}

async function loadCounselors() {
    try {
        const response = await fetch('/api/admin/counselors/list');
        const data = await response.json();
        
        if (data.success) {
            counselors = data.counselors;
        } else {
            console.error('Error loading counselors:', data.message);
        }
    } catch (error) {
        console.error('Error loading counselors:', error);
    }
}

// =============================================================================
// TABLE RENDERING
// =============================================================================

function renderAppointmentsTable() {
    const tbody = document.getElementById('appointments-tbody');
    const emptyState = document.getElementById('empty-state');
    
    if (appointments.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        updateAppointmentCount(0);
        return;
    }
    
    emptyState.style.display = 'none';
    
    tbody.innerHTML = appointments.map(appointment => {
        return `
            <tr class="fade-in">
                <td>
                    <div class="student-info">
                        <div class="student-avatar">
                            ${appointment.student.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div class="student-details">
                            <div class="name">${appointment.student.name}</div>
                            <div class="meta">${appointment.student.student_id} • ${appointment.student.course}</div>
                        </div>
                    </div>
                </td>
                <td>
                    ${appointment.counselor ? `
                        <div class="counselor-info">
                            <div class="counselor-avatar">
                                ${appointment.counselor.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div class="student-details">
                                <div class="name">${appointment.counselor.name}</div>
                                <div class="meta">${appointment.counselor.specialization}</div>
                            </div>
                        </div>
                    ` : `
                        <span class="unassigned">
                            <i class="fas fa-user-clock"></i> Not Assigned
                        </span>
                    `}
                </td>
                <td>
                    <div style="font-weight: 600; color: var(--text-primary);">
                        ${formatDateTime(appointment.scheduled_date)}
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">
                        ${appointment.duration} minutes
                    </div>
                </td>
                <td>
                    <div style="font-weight: 500;">${appointment.topic}</div>
                </td>
                <td>
                    <span class="status-badge status-${appointment.status}">
                        ${getStatusText(appointment.status)}
                    </span>
                </td>
                <td>
                    <span class="priority-badge priority-${appointment.priority}">
                        ${appointment.priority.toUpperCase()}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button type="button" class="btn btn-outline-primary btn-icon" 
                                onclick="viewAppointmentDetails(${appointment.id})" 
                                title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${!appointment.counselor ? `
                            <button type="button" class="btn btn-success btn-sm" 
                                    onclick="openAssignCounselorModal(${appointment.id})" 
                                    title="Assign Counselor">
                                <i class="fas fa-user-plus"></i> Assign
                            </button>
                        ` : `
                            <button type="button" class="btn btn-warning btn-sm" 
                                    onclick="openReassignModal(${appointment.id})" 
                                    title="Reassign Counselor">
                                <i class="fas fa-exchange-alt"></i> Reassign
                            </button>
                        `}
                        <button type="button" class="btn btn-danger btn-sm" 
                                onclick="confirmCancelAppointment(${appointment.id})" 
                                title="Cancel Appointment">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                        <button type="button" class="btn btn-outline-primary btn-sm" 
                                onclick="confirmDeleteAppointment(${appointment.id})" 
                                title="Delete Appointment">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    updateAppointmentCount(appointments.length);
}

// =============================================================================
// MODAL FUNCTIONS
// =============================================================================

function openAssignCounselorModal(appointmentId) {
    currentAppointmentId = appointmentId;
    const appointment = appointments.find(a => a.id === appointmentId);
    
    if (!appointment) {
        showAlert('Appointment not found', 'danger');
        return;
    }
    
    // Populate student info
    document.getElementById('student-info').innerHTML = `
        <div class="student-info">
            <div class="student-avatar">
                ${appointment.student.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div class="student-details">
                <div class="name">${appointment.student.name}</div>
                <div class="meta">${appointment.student.student_id} • ${appointment.student.email}</div>
                <div class="meta">${appointment.student.course}</div>
            </div>
        </div>
    `;
    
    // Populate appointment info
    document.getElementById('appointment-info').innerHTML = `
        <div style="margin-bottom: 0.5rem;">
            <strong>Date:</strong> ${formatDateTime(appointment.scheduled_date)}
        </div>
        <div style="margin-bottom: 0.5rem;">
            <strong>Duration:</strong> ${appointment.duration} minutes
        </div>
        <div style="margin-bottom: 0.5rem;">
            <strong>Topic:</strong> ${appointment.topic}
        </div>
        <div style="margin-bottom: 0.5rem;">
            <strong>Priority:</strong> <span class="priority-badge priority-${appointment.priority}">${appointment.priority.toUpperCase()}</span>
        </div>
        ${appointment.notes ? `<div><strong>Notes:</strong> ${appointment.notes}</div>` : ''}
    `;
    
    // Populate counselor options
    populateCounselorOptions();
    
    // Set appointment ID
    document.getElementById('appointment-id').value = appointmentId;
    
    // Show modal
    showModal('assign-counselor-modal');
}

function populateCounselorOptions() {
    const container = document.getElementById('counselor-options');
    
    if (counselors.length === 0) {
        container.innerHTML = '<div class="alert alert-warning">No counselors available</div>';
        return;
    }
    
    container.innerHTML = counselors.map((counselor, index) => `
        <label class="counselor-option">
            <input type="radio" name="counselor_id" value="${counselor.id}" ${index === 0 ? 'checked' : ''}>
            <div class="counselor-name">${counselor.name}</div>
            <div class="counselor-specialization">${counselor.specialization}</div>
            <div class="counselor-workload">
                <div class="workload-indicator workload-${counselor.workload}"></div>
                <span>${counselor.current_assignments} appointments</span>
                <span style="margin-left: auto;">${counselor.workload} load</span>
            </div>
        </label>
    `).join('');
}

function updateCounselorSelection(radio) {
    // Remove selected class from all options
    document.querySelectorAll('.counselor-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selected class to current option
    radio.closest('.counselor-option').classList.add('selected');
}

function updateModeSelection(radio) {
    // Remove selected class from all mode options
    document.querySelectorAll('.mode-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selected class to current option
    radio.closest('.mode-option').classList.add('selected');
    
    // Update location field
    updateLocationField();
}

function updateLocationField() {
    const selectedMode = document.querySelector('input[name="mode"]:checked').value;
    const locationInput = document.getElementById('location-input');
    const locationLabel = document.getElementById('location-label');
    
    switch (selectedMode) {
        case 'in-person':
            locationLabel.textContent = 'Room/Location';
            locationInput.placeholder = 'e.g., Room 201, Counseling Center';
            locationInput.name = 'location';
            break;
        case 'video':
            locationLabel.textContent = 'Video Meeting Link';
            locationInput.placeholder = 'e.g., https://zoom.us/j/123456789';
            locationInput.name = 'meeting_link';
            break;
        case 'phone':
            locationLabel.textContent = 'Phone Number';
            locationInput.placeholder = 'e.g., +254 700 123 456';
            locationInput.name = 'meeting_link';
            break;
    }
}

async function submitAssignment(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
        showLoading(true);
        
        const response = await fetch(`/api/admin/appointments/${currentAppointmentId}/assign`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert(result.message, 'success');
            closeModal('assign-counselor-modal');
            loadAppointments(); // Refresh the table
        } else {
            showAlert('Error: ' + result.message, 'danger');
        }
    } catch (error) {
        console.error('Error assigning counselor:', error);
        showAlert('Failed to assign counselor. Please try again.', 'danger');
    } finally {
        showLoading(false);
    }
}

async function viewAppointmentDetails(appointmentId) {
    try {
        showLoading(true);
        
        const response = await fetch(`/api/admin/appointments/${appointmentId}/details`);
        const data = await response.json();
        
        if (data.success) {
            const appointment = data.appointment;
            
            document.getElementById('appointment-details-content').innerHTML = `
                <div class="appointment-details">
                    <div class="detail-group">
                        <div class="detail-label">Student Information</div>
                        <div class="detail-value">
                            <div><strong>Name:</strong> ${appointment.student.name}</div>
                            <div><strong>Email:</strong> ${appointment.student.email}</div>
                            <div><strong>Student ID:</strong> ${appointment.student.student_id}</div>
                            <div><strong>Course:</strong> ${appointment.student.course}</div>
                            <div><strong>Year:</strong> ${appointment.student.year}</div>
                            ${appointment.student.phone ? `<div><strong>Phone:</strong> ${appointment.student.phone}</div>` : ''}
                        </div>
                    </div>
                    
                    <div class="detail-group">
                        <div class="detail-label">Appointment Details</div>
                        <div class="detail-value">
                            <div><strong>Status:</strong> <span class="status-badge status-${appointment.status}">${getStatusText(appointment.status)}</span></div>
                            <div><strong>Priority:</strong> <span class="priority-badge priority-${appointment.priority}">${appointment.priority.toUpperCase()}</span></div>
                            <div><strong>Topic:</strong> ${appointment.topic}</div>
                            <div><strong>Mode:</strong> ${appointment.mode || 'In-Person'}</div>
                            <div><strong>Scheduled:</strong> ${formatDateTime(appointment.scheduled_date)}</div>
                            <div><strong>Duration:</strong> ${appointment.duration} minutes</div>
                            ${appointment.location ? `<div><strong>Location:</strong> ${appointment.location}</div>` : ''}
                            ${appointment.meeting_link ? `<div><strong>Meeting Link:</strong> <a href="${appointment.meeting_link}" target="_blank">${appointment.meeting_link}</a></div>` : ''}
                        </div>
                    </div>
                    
                    ${appointment.counselor ? `
                        <div class="detail-group">
                            <div class="detail-label">Assigned Counselor</div>
                            <div class="detail-value">
                                <div><strong>Name:</strong> ${appointment.counselor.name}</div>
                                <div><strong>Email:</strong> ${appointment.counselor.email}</div>
                                <div><strong>Specialization:</strong> ${appointment.counselor.specialization}</div>
                                ${appointment.counselor.phone ? `<div><strong>Phone:</strong> ${appointment.counselor.phone}</div>` : ''}
                            </div>
                        </div>
                    ` : `
                        <div class="detail-group">
                            <div class="alert alert-warning">No counselor assigned yet</div>
                        </div>
                    `}
                    
                    ${appointment.notes ? `
                        <div class="detail-group">
                            <div class="detail-label">Student Notes</div>
                            <div class="detail-value">${appointment.notes}</div>
                        </div>
                    ` : ''}
                    
                    ${appointment.admin_notes ? `
                        <div class="detail-group">
                            <div class="detail-label">Admin Notes</div>
                            <div class="detail-value">${appointment.admin_notes}</div>
                        </div>
                    ` : ''}
                    
                    ${appointment.counselor_notes ? `
                        <div class="detail-group">
                            <div class="detail-label">Counselor Notes</div>
                            <div class="detail-value">${appointment.counselor_notes}</div>
                        </div>
                    ` : ''}
                    
                    <div class="detail-group">
                        <div class="detail-label">Timeline</div>
                        <div class="detail-value">
                            <div><strong>Requested:</strong> ${formatDateTime(appointment.requested_date)}</div>
                            <div><strong>Created:</strong> ${formatDateTime(appointment.created_at)}</div>
                            <div><strong>Last Updated:</strong> ${formatDateTime(appointment.updated_at)}</div>
                        </div>
                    </div>
                </div>
            `;
            
            showModal('view-details-modal');
        } else {
            showAlert('Error: ' + data.message, 'danger');
        }
    } catch (error) {
        console.error('Error loading appointment details:', error);
        showAlert('Failed to load appointment details', 'danger');
    } finally {
        showLoading(false);
    }
}

// =============================================================================
// ACTION FUNCTIONS
// =============================================================================

function openReassignModal(appointmentId) {
    currentAppointmentId = appointmentId;
    const appointment = appointments.find(a => a.id === appointmentId);
    
    confirmAction = () => reassignCounselor(appointmentId);
    
    document.getElementById('confirm-title').textContent = 'Reassign Counselor';
    document.getElementById('confirm-message').textContent = 
        `Are you sure you want to reassign ${appointment.student.name}'s appointment to a different counselor?`;
    document.getElementById('confirm-reason-group').style.display = 'block';
    document.getElementById('confirm-button').textContent = 'Reassign';
    document.getElementById('confirm-button').className = 'btn btn-warning';
    
    showModal('confirm-modal');
}

async function reassignCounselor(appointmentId) {
    const reason = document.getElementById('confirm-reason').value;
    
    // For now, we'll just open the assignment modal
    // In a full implementation, you'd show a counselor selection first
    closeModal('confirm-modal');
    openAssignCounselorModal(appointmentId);
}

function confirmCancelAppointment(appointmentId) {
    const appointment = appointments.find(a => a.id === appointmentId);
    
    confirmAction = () => cancelAppointment(appointmentId);
    
    document.getElementById('confirm-title').textContent = 'Cancel Appointment';
    document.getElementById('confirm-message').textContent = 
        `Are you sure you want to cancel ${appointment.student.name}'s appointment?`;
    document.getElementById('confirm-reason-group').style.display = 'block';
    document.getElementById('confirm-button').textContent = 'Cancel Appointment';
    document.getElementById('confirm-button').className = 'btn btn-danger';
    
    showModal('confirm-modal');
}

async function cancelAppointment(appointmentId) {
    const reason = document.getElementById('confirm-reason').value;
    
    try {
        showLoading(true);
        
        const response = await fetch(`/api/admin/appointments/${appointmentId}/cancel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason: reason })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert(result.message, 'success');
            closeModal('confirm-modal');
            loadAppointments();
        } else {
            showAlert('Error: ' + result.message, 'danger');
        }
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        showAlert('Failed to cancel appointment', 'danger');
    } finally {
        showLoading(false);
    }
}

function confirmDeleteAppointment(appointmentId) {
    const appointment = appointments.find(a => a.id === appointmentId);
    
    confirmAction = () => deleteAppointment(appointmentId);
    
    document.getElementById('confirm-title').textContent = 'Delete Appointment';
    document.getElementById('confirm-message').textContent = 
        `Are you sure you want to permanently delete ${appointment.student.name}'s appointment? This action cannot be undone.`;
    document.getElementById('confirm-reason-group').style.display = 'none';
    document.getElementById('confirm-button').textContent = 'Delete Permanently';
    document.getElementById('confirm-button').className = 'btn btn-danger';
    
    showModal('confirm-modal');
}

async function deleteAppointment(appointmentId) {
    try {
        showLoading(true);
        
        const response = await fetch(`/api/admin/appointments/${appointmentId}/delete`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert(result.message, 'success');
            closeModal('confirm-modal');
            loadAppointments();
        } else {
            showAlert('Error: ' + result.message, 'danger');
        }
    } catch (error) {
        console.error('Error deleting appointment:', error);
        showAlert('Failed to delete appointment', 'danger');
    } finally {
        showLoading(false);
    }
}

function executeConfirmedAction() {
    if (confirmAction) {
        confirmAction();
        confirmAction = null;
    }
}

// =============================================================================
// FILTER FUNCTIONS
// =============================================================================

function applyFilters() {
    const statusFilter = document.getElementById('status-filter').value;
    const counselorFilter = document.getElementById('counselor-filter').value;
    const priorityFilter = document.getElementById('priority-filter').value;
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    const filteredAppointments = appointments.filter(appointment => {
        // Status filter
        if (statusFilter && appointment.status !== statusFilter) return false;
        
        // Counselor filter
        if (counselorFilter) {
            if (counselorFilter === 'unassigned' && appointment.counselor) return false;
            if (counselorFilter !== 'unassigned' && (!appointment.counselor || appointment.counselor.id != counselorFilter)) return false;
        }
        
        // Priority filter
        if (priorityFilter && appointment.priority !== priorityFilter) return false;
        
        // Search filter
        if (searchTerm) {
            const searchableText = `
                ${appointment.student.name}
                ${appointment.student.email}
                ${appointment.student.student_id}
                ${appointment.topic}
            `.toLowerCase();
            
            if (!searchableText.includes(searchTerm)) return false;
        }
        
        return true;
    });
    
    // Update global appointments for rendering
    const originalAppointments = [...appointments];
    appointments = filteredAppointments;
    renderAppointmentsTable();
    appointments = originalAppointments; // Restore original
}

function clearFilters() {
    document.getElementById('status-filter').value = '';
    document.getElementById('counselor-filter').value = '';
    document.getElementById('priority-filter').value = '';
    document.getElementById('search-input').value = '';
    
    renderAppointmentsTable();
}

function showUnassignedOnly() {
    document.getElementById('counselor-filter').value = 'unassigned';
    applyFilters();
}

function showTodayOnly() {
    // Filter for today's appointments
    const today = new Date().toISOString().split('T')[0];
    const originalAppointments = [...appointments];
    
    appointments = appointments.filter(appointment => {
        if (!appointment.scheduled_date) return false;
        const appointmentDate = appointment.scheduled_date.split('T')[0];
        return appointmentDate === today;
    });
    
    renderAppointmentsTable();
    appointments = originalAppointments; // Restore original
}

function showPendingOnly() {
    document.getElementById('status-filter').value = 'pending';
    applyFilters();
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('show');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reset form if it's the assignment modal
    if (modalId === 'assign-counselor-modal') {
        document.getElementById('assign-counselor-form').reset();
        // Reset mode selection to in-person
        document.querySelector('input[name="mode"][value="in-person"]').checked = true;
        updateLocationField();
        // Remove selected classes
        document.querySelectorAll('.counselor-option, .mode-option').forEach(option => {
            option.classList.remove('selected');
        });
        // Select first counselor option
        const firstCounselor = document.querySelector('input[name="counselor_id"]');
        if (firstCounselor) {
            firstCounselor.checked = true;
            firstCounselor.closest('.counselor-option').classList.add('selected');
        }
        // Select in-person mode
        document.querySelector('.mode-option input[value="in-person"]').closest('.mode-option').classList.add('selected');
    }
    
    // Reset confirm modal
    if (modalId === 'confirm-modal') {
        document.getElementById('confirm-reason').value = '';
        confirmAction = null;
    }
}

function showLoading(show) {
    const loadingState = document.getElementById('loading-state');
    if (show) {
        loadingState.style.display = 'flex';
    } else {
        loadingState.style.display = 'none';
    }
}

function showAlert(message, type) {
    const alertsContainer = document.getElementById('flash-messages');
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} fade-in`;
    alertDiv.innerHTML = `
        <span>${message}</span>
        <button type="button" style="background: none; border: none; float: right; font-size: 1.2rem; cursor: pointer;" onclick="this.parentElement.remove()">
            &times;
        </button>
    `;
    
    alertsContainer.appendChild(alertDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

function formatDateTime(dateString) {
    if (!dateString) return 'TBD';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Pending',
        'assigned': 'Assigned',
        'scheduled': 'Scheduled',
        'completed': 'Completed',
        'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
}

function updateAppointmentCount(count) {
    document.getElementById('appointment-count').textContent = count;
}

function updateStatistics() {
    // Count appointments by status
    const stats = {
        pending: 0,
        assigned: 0,
        scheduled: 0,
        completed: 0,
        urgent: 0,
        today: 0
    };
    
    const today = new Date().toISOString().split('T')[0];
    
    appointments.forEach(appointment => {
        stats[appointment.status]++;
        
        if (appointment.priority === 'urgent') {
            stats.urgent++;
        }
        
        if (appointment.scheduled_date && appointment.scheduled_date.split('T')[0] === today) {
            stats.today++;
        }
    });
    
    // Update stat cards
    Object.keys(stats).forEach(key => {
        const element = document.getElementById(`stat-${key}`);
        if (element) {
            element.textContent = stats[key];
        }
    });
}

// =============================================================================
// REFRESH AND EXPORT FUNCTIONS
// =============================================================================

function refreshData() {
    loadAppointments();
}

function refreshTable() {
    loadAppointments();
}

function exportData() {
    // For now, just show an alert. In a full implementation, you'd generate and download a file
    showAlert('Export functionality would be implemented here', 'info');
}

// =============================================================================
// KEYBOARD SHORTCUTS
// =============================================================================

document.addEventListener('keydown', function(e) {
    // ESC to close modals
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
            closeModal(openModal.id);
        }
    }
    
    // Ctrl+R to refresh
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        refreshData();
    }
});

console.log('✅ Admin Appointments Management System loaded successfully');