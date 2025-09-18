// Admin JavaScript Functions - CUEA MindConnect
// ==============================================================================
//ADMIN FUNCTIONS
// ==============================================================================


// =============================================================================
// GLOBAL UTILITIES
// =============================================================================

// Show loading spinner
function showLoading(element) {
    const spinner = '<div class="spinner-border spinner-border-sm me-2" role="status"></div>';
    element.innerHTML = spinner + element.innerHTML;
    element.disabled = true;
}

// Hide loading spinner
function hideLoading(element, originalText) {
    element.innerHTML = originalText;
    element.disabled = false;
}

// Show toast notification
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    const toastId = 'toast-' + Date.now();
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.id = toastId;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Create toast container if it doesn't exist
function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '1055';
    document.body.appendChild(container);
    return container;
}

// Confirm dialog
function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Generate random password
function generateRandomPassword(length = 12) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
}


//=============================================================================
// DASHBOARD FUNCTIONS - CUEA MindConnect Admin Dashboard
// Real data integration with Flask backend
//=============================================================================

// =============================================================================
// GLOBAL VARIABLES
// =============================================================================

let registrationChart = null;
let moodChart = null;
let autoRefreshEnabled = false;
let refreshInterval = null;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Show toast notification
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    toast.style.cssText = 'top: 20px; right: 20px; z-index: 1060; max-width: 400px;';
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-triangle' : 'info-circle'}"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 5000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);
    return container;
}

// =============================================================================
// CHART FUNCTIONS WITH REAL DATA
// =============================================================================

// Initialize user registration chart with real data
function initializeRegistrationChart() {
    const ctx = document.getElementById('registrationChart');
    if (!ctx) return;

    // Destroy existing chart
    if (registrationChart) {
        registrationChart.destroy();
    }

    // Use real data from backend
    const realLabels = window.dashboardData?.chartLabels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const realData = window.dashboardData?.chartData || [0, 0, 0, 0, 0, 0, 0];

    registrationChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: realLabels,
            datasets: [{
                label: 'New Registrations',
                data: realData,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3498db',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#3498db',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            return Number.isInteger(value) ? value : '';
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// Initialize mood assessment chart with real data
function initializeMoodChart() {
    const ctx = document.getElementById('moodChart');
    if (!ctx) return;

    // Destroy existing chart
    if (moodChart) {
        moodChart.destroy();
    }

    // Use real data from backend
    const positiveCount = window.dashboardData?.moodPositive || 0;
    const neutralCount = window.dashboardData?.moodNeutral || 0;
    const needsSupportCount = window.dashboardData?.moodNeedsSupport || 0;

    // Calculate percentages
    const total = positiveCount + neutralCount + needsSupportCount;
    const positivePercent = total > 0 ? Math.round((positiveCount / total) * 100) : 0;
    const neutralPercent = total > 0 ? Math.round((neutralCount / total) * 100) : 0;
    const needsSupportPercent = total > 0 ? Math.round((needsSupportCount / total) * 100) : 0;

    const data = {
        labels: [
            `Positive (${positivePercent}%)`,
            `Neutral (${neutralPercent}%)`,
            `Needs Support (${needsSupportPercent}%)`
        ],
        datasets: [{
            data: [positiveCount, neutralCount, needsSupportCount],
            backgroundColor: [
                '#27ae60',  // Green for positive
                '#f39c12',  // Orange for neutral
                '#e74c3c'   // Red for needs support
            ],
            borderWidth: 0,
            hoverBorderWidth: 3,
            hoverBorderColor: '#fff'
        }]
    };

    moodChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const percent = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value} (${percent}%)`;
                        }
                    }
                }
            },
            cutout: '60%',
            animation: {
                animateRotate: true,
                duration: 1000
            }
        }
    });

    // Add center text showing total assessments
    if (total > 0) {
        const centerText = {
            id: 'centerText',
            beforeDatasetsDraw(chart) {
                const { ctx, data } = chart;
                ctx.save();
                ctx.font = 'bold 20px Arial';
                ctx.fillStyle = '#2c3e50';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
                const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
                ctx.fillText(total.toString(), centerX, centerY - 10);
                ctx.font = '12px Arial';
                ctx.fillText('Total', centerX, centerY + 10);
                ctx.restore();
            }
        };
        
        Chart.register(centerText);
    }
}

// =============================================================================
// DASHBOARD FUNCTIONS
// =============================================================================

// Update stat numbers with animation
function updateStatCard(selector, newValue) {
    const element = document.querySelector(selector);
    if (!element) return;
    
    const currentValue = parseInt(element.textContent) || 0;
    
    // Simple animation
    const duration = 1000;
    const steps = 20;
    const increment = (newValue - currentValue) / steps;
    let current = currentValue;
    
    const timer = setInterval(() => {
        current += increment;
        element.textContent = Math.round(current);
        
        if (Math.abs(current - newValue) < Math.abs(increment)) {
            element.textContent = newValue;
            clearInterval(timer);
        }
    }, duration / steps);
}

// Refresh dashboard data - fetch new data from server
function refreshDashboard() {
    showToast('Refreshing dashboard...', 'info');
    
    // Fetch fresh data from server
    fetch('/admin-dashboard-data', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Update global data
        window.dashboardData = data;
        
        // Update stat cards with new data
        updateStatCard('[data-stat="users"] .stats-number', data.totalUsers || 0);
        updateStatCard('[data-stat="counselors"] .stats-number', data.totalCounselors || 0);
        updateStatCard('[data-stat="appointments"] .stats-number', data.upcomingAppointments || 0);
        updateStatCard('[data-stat="assessments"] .stats-number', data.totalAssessments || 0);
        
        // Refresh charts with new data
        setTimeout(() => {
            initializeRegistrationChart();
            initializeMoodChart();
        }, 500);
        
        showToast('Dashboard refreshed successfully', 'success');
    })
    .catch(error => {
        console.error('Error refreshing dashboard:', error);
        showToast('Failed to refresh dashboard', 'danger');
        
        // Fallback: refresh charts with existing data
        initializeRegistrationChart();
        initializeMoodChart();
    });
}

// Export dashboard data
function exportDashboardData() {
    showToast('Preparing export...', 'info');
    
    const exportData = {
        exported_at: new Date().toISOString(),
        dashboard_stats: {
            total_users: document.querySelector('[data-stat="users"] .stats-number')?.textContent || '0',
            total_counselors: document.querySelector('[data-stat="counselors"] .stats-number')?.textContent || '0',
            total_appointments: document.querySelector('[data-stat="appointments"] .stats-number')?.textContent || '0',
            total_assessments: document.querySelector('[data-stat="assessments"] .stats-number')?.textContent || '0'
        },
        registration_data: {
            labels: window.dashboardData?.chartLabels || [],
            data: window.dashboardData?.chartData || []
        },
        mood_data: {
            positive: window.dashboardData?.moodPositive || 0,
            neutral: window.dashboardData?.moodNeutral || 0,
            needs_support: window.dashboardData?.moodNeedsSupport || 0
        },
        monthly_trends: {
            labels: window.dashboardData?.monthlyLabels || [],
            data: window.dashboardData?.monthlyData || []
        }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cuea-mindconnect-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Dashboard data exported successfully', 'success');
}

// Quick action functions
function quickActionAddUser() {
    window.location.href = '/admin/users';
}

function quickActionAddCounselor() {
    window.location.href = '/admin/counselors';
}

function quickActionViewReports() {
    window.location.href = '/admin/analytics';
}

function quickActionSystemHealth() {
    window.location.href = '/admin/system-health';
}

// =============================================================================
// AUTO-REFRESH FUNCTIONALITY
// =============================================================================

function toggleAutoRefresh() {
    const button = document.getElementById('autoRefreshBtn');
    if (!button) return;
    
    if (autoRefreshEnabled) {
        // Disable auto-refresh
        if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
        }
        autoRefreshEnabled = false;
        button.innerHTML = '<i class="fas fa-play"></i> Enable Auto-refresh';
        button.classList.remove('btn-warning');
        button.classList.add('btn-success');
        showToast('Auto-refresh disabled', 'info');
    } else {
        // Enable auto-refresh every 30 seconds
        refreshInterval = setInterval(() => {
            refreshDashboard();
        }, 30000);
        
        autoRefreshEnabled = true;
        button.innerHTML = '<i class="fas fa-pause"></i> Disable Auto-refresh';
        button.classList.remove('btn-success');
        button.classList.add('btn-warning');
        showToast('Auto-refresh enabled (30s interval)', 'info');
    }
}

// =============================================================================
// KEYBOARD SHORTCUTS
// =============================================================================

function handleKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + R for refresh
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            refreshDashboard();
        }
        
        // Ctrl/Cmd + E for export
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            exportDashboardData();
        }
        
        // Ctrl/Cmd + A for auto-refresh toggle
        if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
            e.preventDefault();
            toggleAutoRefresh();
        }
    });
}

// =============================================================================
// RESPONSIVE HANDLING
// =============================================================================

function handleResize() {
    // Resize charts when window changes
    if (registrationChart) {
        registrationChart.resize();
    }
    if (moodChart) {
        moodChart.resize();
    }
}

// =============================================================================
// DATA VALIDATION AND ERROR HANDLING
// =============================================================================

function validateDashboardData() {
    if (!window.dashboardData) {
        console.warn('Dashboard data not found, using default values');
        window.dashboardData = {
            chartLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            chartData: [0, 0, 0, 0, 0, 0, 0],
            moodPositive: 0,
            moodNeutral: 0,
            moodNeedsSupport: 0,
            monthlyLabels: [],
            monthlyData: []
        };
        showToast('Using default data - please refresh', 'warning');
    }
}

// =============================================================================
// CHART ANIMATIONS AND INTERACTIONS
// =============================================================================

function addChartInteractions() {
    // Add click handlers for chart elements if needed
    if (registrationChart) {
        registrationChart.options.onClick = function(event, elements) {
            if (elements.length > 0) {
                const clickedIndex = elements[0].index;
                const label = registrationChart.data.labels[clickedIndex];
                const value = registrationChart.data.datasets[0].data[clickedIndex];
                showToast(`${label}: ${value} new registrations`, 'info');
            }
        };
    }
    
    if (moodChart) {
        moodChart.options.onClick = function(event, elements) {
            if (elements.length > 0) {
                const clickedIndex = elements[0].index;
                const label = moodChart.data.labels[clickedIndex];
                const value = moodChart.data.datasets[0].data[clickedIndex];
                showToast(`${label}: ${value} assessments`, 'info');
            }
        };
    }
}

// =============================================================================
// DASHBOARD HEALTH CHECK
// =============================================================================

function checkDashboardHealth() {
    // Simple health check for dashboard functionality
    const healthChecks = {
        chartsLoaded: !!(registrationChart && moodChart),
        dataAvailable: !!window.dashboardData,
        buttonsWorking: !!(document.getElementById('refreshDashboard') && document.getElementById('exportDashboard')),
        autoRefreshReady: document.getElementById('autoRefreshBtn') !== null
    };
    
    const allHealthy = Object.values(healthChecks).every(check => check);
    
    if (!allHealthy) {
        console.warn('Dashboard health check failed:', healthChecks);
        showToast('Dashboard partially loaded - some features may not work', 'warning');
    }
    
    return healthChecks;
}

// =============================================================================
// INITIALIZATION
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing CUEA MindConnect Admin Dashboard...');
    
    // Create toast container
    createToastContainer();
    
    // Validate data first
    validateDashboardData();
    
    // Initialize charts with a small delay to ensure DOM is ready
    setTimeout(() => {
        initializeRegistrationChart();
        initializeMoodChart();
        addChartInteractions();
    }, 500);
    
    // Set up event listeners
    window.addEventListener('resize', handleResize);
    
    // Handle keyboard shortcuts
    handleKeyboardShortcuts();
    
    // Add click handlers for buttons
    const refreshBtn = document.getElementById('refreshDashboard');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshDashboard);
    }
    
    const exportBtn = document.getElementById('exportDashboard');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportDashboardData);
    }
    
    const autoRefreshBtn = document.getElementById('autoRefreshBtn');
    if (autoRefreshBtn) {
        autoRefreshBtn.addEventListener('click', toggleAutoRefresh);
    }
    
    // Run health check
    setTimeout(() => {
        const health = checkDashboardHealth();
        if (health.chartsLoaded && health.dataAvailable) {
            showToast('Dashboard loaded successfully', 'success');
        }
    }, 1000);
    
    // Clean up on page unload
    window.addEventListener('beforeunload', function() {
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
        if (registrationChart) {
            registrationChart.destroy();
        }
        if (moodChart) {
            moodChart.destroy();
        }
    });
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

window.addEventListener('error', function(e) {
    console.error('Dashboard error:', e.error);
    showToast('An error occurred. Please refresh the page.', 'danger');
});

// Handle chart.js errors specifically
Chart.defaults.plugins.legend.onClick = function(e, legendItem, legend) {
    try {
        const index = legendItem.datasetIndex;
        const chart = legend.chart;
        const meta = chart.getDatasetMeta(index);
        meta.hidden = meta.hidden === null ? !chart.data.datasets[index].hidden : null;
        chart.update();
    } catch (error) {
        console.error('Chart legend error:', error);
        showToast('Chart interaction error', 'warning');
    }
};

// =============================================================================
// GLOBAL FUNCTIONS FOR ONCLICK HANDLERS
// =============================================================================

// Make functions globally available for HTML onclick handlers
window.dashboardFunctions = {
    refreshDashboard,
    exportDashboardData,
    toggleAutoRefresh,
    quickActionAddUser,
    quickActionAddCounselor,
    quickActionViewReports,
    quickActionSystemHealth,
    showToast
};

// Also make individual functions global for backward compatibility
window.refreshDashboard = refreshDashboard;
window.exportDashboardData = exportDashboardData;
window.toggleAutoRefresh = toggleAutoRefresh;
window.quickActionAddUser = quickActionAddUser;
window.quickActionAddCounselor = quickActionAddCounselor;
window.quickActionViewReports = quickActionViewReports;
window.quickActionSystemHealth = quickActionSystemHealth;

console.log('CUEA MindConnect Dashboard JavaScript loaded successfully');



// =============================================================================
// USER MANAGEMENT FUNCTIONS
// =============================================================================

// Admin Users Management JavaScript - CUEA MindConnect
// Complete user management functionality with search, filters, CRUD operations

// =============================================================================
// GLOBAL VARIABLES AND CONFIGURATION
// =============================================================================

let currentUserData = null;
let filteredUsers = [];
let sortColumn = null;
let sortDirection = 'asc';

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Show toast notification
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    const toastId = 'toast-' + Date.now();
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.id = toastId;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Create toast container if it doesn't exist
function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '1055';
    document.body.appendChild(container);
    return container;
}

// Confirm dialog with enhanced styling
function confirmAction(message, callback, title = 'Confirm Action') {
    const modal = document.getElementById('confirmationModal') || createConfirmationModal();
    
    modal.querySelector('.modal-title').textContent = title;
    modal.querySelector('.modal-body').innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-exclamation-triangle text-warning me-3 fa-2x"></i>
            <div>${message}</div>
        </div>
    `;
    
    const confirmBtn = modal.querySelector('#confirmActionBtn');
    confirmBtn.onclick = function() {
        bootstrap.Modal.getInstance(modal).hide();
        callback();
    };
    
    new bootstrap.Modal(modal).show();
}

// Create confirmation modal if it doesn't exist
function createConfirmationModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'confirmationModal';
    modal.tabIndex = -1;
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Confirm Action</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <!-- Content will be set dynamically -->
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" id="confirmActionBtn">Confirm</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

// Show loading spinner
function showLoading(element, text = 'Loading...') {
    const spinner = '<div class="spinner-border spinner-border-sm me-2" role="status"></div>';
    element.disabled = true;
    element.dataset.originalText = element.innerHTML;
    element.innerHTML = spinner + text;
}

// Hide loading spinner
function hideLoading(element) {
    element.disabled = false;
    element.innerHTML = element.dataset.originalText || element.innerHTML;
}

// Generate random password
function generateRandomPassword(length = 12) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.random() * charset.length);
    }
    return password;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Debounce function for search inputs
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// =============================================================================
// SEARCH AND FILTER FUNCTIONS
// =============================================================================

// Initialize user filters and search
function initializeUserFilters() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const courseFilter = document.getElementById('courseFilter');
    const yearFilter = document.getElementById('yearFilter');
    const table = document.getElementById('usersTable');

    if (!table) return;

    // Debounced search function
    const debouncedFilter = debounce(filterTable, 300);

    function filterTable() {
        const searchTerm = searchInput?.value.toLowerCase() || '';
        const statusValue = statusFilter?.value || '';
        const courseValue = courseFilter?.value || '';
        const yearValue = yearFilter?.value || '';
        
        const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
        let visibleCount = 0;
        
        filteredUsers = [];
        
        Array.from(rows).forEach(row => {
            const name = row.cells[1].textContent.toLowerCase();
            const email = row.cells[2].textContent.toLowerCase();
            const studentId = row.cells[3].textContent.toLowerCase();
            const course = row.cells[4].textContent;
            const year = row.cells[5].textContent;
            const status = row.cells[6].textContent.toLowerCase();
            
            const matchesSearch = name.includes(searchTerm) || 
                                email.includes(searchTerm) || 
                                studentId.includes(searchTerm);
            const matchesStatus = !statusValue || status.includes(statusValue);
            const matchesCourse = !courseValue || course === courseValue;
            const matchesYear = !yearValue || year.includes(yearValue);
            
            const isVisible = matchesSearch && matchesStatus && matchesCourse && matchesYear;
            
            if (isVisible) {
                row.style.display = '';
                visibleCount++;
                filteredUsers.push(getUserDataFromRow(row));
            } else {
                row.style.display = 'none';
            }
        });
        
        updateUserCount(visibleCount, rows.length);
        updateBulkActionVisibility();
    }

    // Add event listeners
    searchInput?.addEventListener('input', debouncedFilter);
    statusFilter?.addEventListener('change', filterTable);
    courseFilter?.addEventListener('change', filterTable);
    yearFilter?.addEventListener('change', filterTable);
}

// Extract user data from table row
function getUserDataFromRow(row) {
    return {
        id: row.cells[0].textContent,
        name: row.cells[1].querySelector('.fw-bold').textContent,
        email: row.cells[2].textContent,
        studentId: row.cells[3].textContent,
        course: row.cells[4].textContent,
        year: row.cells[5].textContent,
        status: row.cells[6].textContent.trim(),
        registered: row.cells[7].textContent,
        lastLogin: row.cells[8].textContent
    };
}

// Update user count display
function updateUserCount(visible, total) {
    const countElement = document.querySelector('.card-header h5');
    if (countElement) {
        countElement.textContent = `All Students (${visible}/${total})`;
    }
}

// Clear all filters
function clearFilters() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const courseFilter = document.getElementById('courseFilter');
    const yearFilter = document.getElementById('yearFilter');
    
    if (searchInput) searchInput.value = '';
    if (statusFilter) statusFilter.value = '';
    if (courseFilter) courseFilter.value = '';
    if (yearFilter) yearFilter.value = '';
    
    // Trigger filter function
    initializeUserFilters();
    showToast('Filters cleared', 'info');
}

// Advanced search modal
function openAdvancedSearch() {
    const modal = document.getElementById('advancedSearchModal') || createAdvancedSearchModal();
    new bootstrap.Modal(modal).show();
}

function createAdvancedSearchModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'advancedSearchModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Advanced Search</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="advancedSearchForm">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Registration Date Range</label>
                                    <div class="row">
                                        <div class="col-6">
                                            <input type="date" class="form-control" name="dateFrom" placeholder="From">
                                        </div>
                                        <div class="col-6">
                                            <input type="date" class="form-control" name="dateTo" placeholder="To">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Last Login</label>
                                    <select class="form-select" name="lastLogin">
                                        <option value="">Any time</option>
                                        <option value="never">Never logged in</option>
                                        <option value="7days">Last 7 days</option>
                                        <option value="30days">Last 30 days</option>
                                        <option value="90days">Last 90 days</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Has Phone Number</label>
                                    <select class="form-select" name="hasPhone">
                                        <option value="">Either</option>
                                        <option value="yes">Yes</option>
                                        <option value="no">No</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Newsletter Subscription</label>
                                    <select class="form-select" name="newsletter">
                                        <option value="">Either</option>
                                        <option value="yes">Subscribed</option>
                                        <option value="no">Not subscribed</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="executeAdvancedSearch()">Search</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

function executeAdvancedSearch() {
    // Implementation for advanced search
    showToast('Advanced search executed', 'success');
    bootstrap.Modal.getInstance(document.getElementById('advancedSearchModal')).hide();
}

// =============================================================================
// SORTING FUNCTIONS
// =============================================================================

// Sort table by column
function sortTable(columnIndex, columnName) {
    const table = document.getElementById('usersTable');
    const tbody = table.getElementsByTagName('tbody')[0];
    const rows = Array.from(tbody.getElementsByTagName('tr'));
    
    // Determine sort direction
    if (sortColumn === columnIndex) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortDirection = 'asc';
        sortColumn = columnIndex;
    }
    
    // Sort rows
    rows.sort((a, b) => {
        let aValue = a.cells[columnIndex].textContent.trim();
        let bValue = b.cells[columnIndex].textContent.trim();
        
        // Handle different data types
        if (columnName === 'id' || columnName === 'year') {
            aValue = parseInt(aValue) || 0;
            bValue = parseInt(bValue) || 0;
        } else if (columnName === 'registered' || columnName === 'lastLogin') {
            aValue = new Date(aValue === 'Never' ? 0 : aValue);
            bValue = new Date(bValue === 'Never' ? 0 : bValue);
        }
        
        if (sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
    
    // Rebuild table body
    rows.forEach(row => tbody.appendChild(row));
    
    // Update sort indicators
    updateSortIndicators(columnIndex);
    
    showToast(`Sorted by ${columnName} (${sortDirection})`, 'info');
}

// Update sort indicators in table headers
function updateSortIndicators(activeColumn) {
    const headers = document.querySelectorAll('#usersTable th[onclick]');
    headers.forEach((header, index) => {
        const icon = header.querySelector('.sort-icon') || createSortIcon(header);
        
        if (index === activeColumn) {
            icon.className = `sort-icon fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`;
            header.classList.add('sorted');
        } else {
            icon.className = 'sort-icon fas fa-sort';
            header.classList.remove('sorted');
        }
    });
}

function createSortIcon(header) {
    const icon = document.createElement('i');
    icon.className = 'sort-icon fas fa-sort ms-1';
    header.appendChild(icon);
    return icon;
}

// =============================================================================
// USER MANAGEMENT FUNCTIONS
// =============================================================================

// Generate password for user form
function generatePassword() {
    const passwordField = document.getElementById('tempPassword');
    if (passwordField) {
        const password = generateRandomPassword();
        passwordField.value = password;
        passwordField.type = 'text'; // Show generated password
        
        // Show password strength
        showPasswordStrength(password);
        
        // Hide password after 3 seconds
        setTimeout(() => {
            passwordField.type = 'password';
        }, 3000);
        
        showToast('Password generated successfully', 'success');
    }
}

// Show password strength indicator
function showPasswordStrength(password) {
    const strengthIndicator = document.getElementById('passwordStrength') || createPasswordStrengthIndicator();
    
    let strength = 0;
    let strengthText = '';
    let strengthClass = '';
    
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    switch (strength) {
        case 0-1:
            strengthText = 'Very Weak';
            strengthClass = 'bg-danger';
            break;
        case 2:
            strengthText = 'Weak';
            strengthClass = 'bg-warning';
            break;
        case 3:
            strengthText = 'Fair';
            strengthClass = 'bg-info';
            break;
        case 4:
            strengthText = 'Good';
            strengthClass = 'bg-primary';
            break;
        case 5:
            strengthText = 'Strong';
            strengthClass = 'bg-success';
            break;
    }
    
    strengthIndicator.innerHTML = `
        <div class="progress" style="height: 6px;">
            <div class="progress-bar ${strengthClass}" style="width: ${(strength/5)*100}%"></div>
        </div>
        <small class="text-muted">Password strength: ${strengthText}</small>
    `;
}

function createPasswordStrengthIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'passwordStrength';
    indicator.className = 'mt-2';
    
    const passwordField = document.getElementById('tempPassword');
    if (passwordField) {
        passwordField.parentNode.appendChild(indicator);
    }
    
    return indicator;
}

// View user details
function viewUser(userId) {
    const button = event.target;
    showLoading(button, 'Loading...');
    
    fetch(`/admin/users/${userId}/details`)
        .then(response => response.json())
        .then(data => {
            hideLoading(button);
            
            const modal = document.getElementById('userDetailsModal');
            const content = document.getElementById('userDetailsContent');
            
            content.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <h6 class="border-bottom pb-2">Personal Information</h6>
                        <table class="table table-sm table-borderless">
                            <tr><td><strong>Full Name:</strong></td><td>${data.user.name}</td></tr>
                            <tr><td><strong>Email:</strong></td><td><a href="mailto:${data.user.email}">${data.user.email}</a></td></tr>
                            <tr><td><strong>Username:</strong></td><td>${data.user.username}</td></tr>
                            <tr><td><strong>Student ID:</strong></td><td><span class="badge bg-primary">${data.user.student_id}</span></td></tr>
                            <tr><td><strong>Phone:</strong></td><td>${data.user.phone || '<em class="text-muted">Not provided</em>'}</td></tr>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <h6 class="border-bottom pb-2">Academic Information</h6>
                        <table class="table table-sm table-borderless">
                            <tr><td><strong>Course:</strong></td><td>${data.user.course}</td></tr>
                            <tr><td><strong>Year of Study:</strong></td><td>Year ${data.user.year_of_study}</td></tr>
                            <tr><td><strong>Status:</strong></td><td>
                                <span class="badge ${data.user.is_active ? 'bg-success' : 'bg-danger'}">
                                    ${data.user.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </td></tr>
                            <tr><td><strong>Registered:</strong></td><td>${data.user.created_at}</td></tr>
                            <tr><td><strong>Last Login:</strong></td><td>${data.user.last_login}</td></tr>
                        </table>
                    </div>
                </div>
                <div class="row mt-3">
                    <div class="col-md-6">
                        <h6 class="border-bottom pb-2">Emergency Contact</h6>
                        <table class="table table-sm table-borderless">
                            <tr><td><strong>Contact Person:</strong></td><td>${data.user.emergency_contact}</td></tr>
                            <tr><td><strong>Phone Number:</strong></td><td><a href="tel:${data.user.emergency_phone}">${data.user.emergency_phone}</a></td></tr>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <h6 class="border-bottom pb-2">Activity Summary</h6>
                        <table class="table table-sm table-borderless">
                            <tr><td><strong>Assessments Taken:</strong></td><td><span class="badge bg-info">${data.assessments_count}</span></td></tr>
                            <tr><td><strong>Appointments:</strong></td><td><span class="badge bg-primary">${data.appointments_count}</span></td></tr>
                            <tr><td><strong>Forum Posts:</strong></td><td><span class="badge bg-secondary">${data.forum_posts_count}</span></td></tr>
                        </table>
                    </div>
                </div>
                
                <div class="mt-3">
                    <h6 class="border-bottom pb-2">Account Actions</h6>
                    <div class="btn-group" role="group">
                        <button type="button" class="btn btn-sm btn-outline-warning" onclick="resetPassword(${userId})">
                            <i class="fas fa-key"></i> Reset Password
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-${data.user.is_active ? 'secondary' : 'success'}" 
                                onclick="toggleUserStatus(${userId}, ${!data.user.is_active})">
                            <i class="fas fa-user-${data.user.is_active ? 'slash' : 'check'}"></i> 
                            ${data.user.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-primary" onclick="sendWelcomeEmail(${userId})">
                            <i class="fas fa-envelope"></i> Send Welcome Email
                        </button>
                    </div>
                </div>
            `;
            
            new bootstrap.Modal(modal).show();
        })
        .catch(error => {
            hideLoading(button);
            console.error('Error:', error);
            showToast('Failed to load user details', 'danger');
        });
}

// Toggle user status (activate/deactivate)
function toggleUserStatus(userId, newStatus) {
    const action = newStatus ? 'activate' : 'deactivate';
    
    confirmAction(
        `Are you sure you want to ${action} this user? ${!newStatus ? 'The user will not be able to log in.' : 'The user will be able to log in again.'}`,
        () => {
            fetch(`/admin/users/${userId}/toggle-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast(data.message, 'success');
                    
                    // Update the table row status
                    updateUserStatusInTable(userId, newStatus);
                    
                    // Close modal if open
                    const detailsModal = bootstrap.Modal.getInstance(document.getElementById('userDetailsModal'));
                    if (detailsModal) {
                        detailsModal.hide();
                    }
                } else {
                    showToast(data.message, 'danger');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('Failed to update user status', 'danger');
            });
        },
        `${action.charAt(0).toUpperCase() + action.slice(1)} User`
    );
}

// Update user status in table without page reload
function updateUserStatusInTable(userId, isActive) {
    const table = document.getElementById('usersTable');
    const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    
    Array.from(rows).forEach(row => {
        if (row.cells[0].textContent === userId.toString()) {
            const statusCell = row.cells[6];
            const actionButtons = row.cells[9].querySelector('.btn-group');
            
            // Update status badge
            statusCell.innerHTML = isActive ? 
                '<span class="badge bg-success">Active</span>' : 
                '<span class="badge bg-danger">Inactive</span>';
            
            // Update action button
            const toggleButton = actionButtons.querySelector(`[onclick*="toggleUserStatus(${userId}"]`);
            if (toggleButton) {
                toggleButton.onclick = () => toggleUserStatus(userId, !isActive);
                toggleButton.title = isActive ? 'Deactivate' : 'Activate';
                toggleButton.innerHTML = `<i class="fas fa-user-${isActive ? 'slash' : 'check'}"></i>`;
                toggleButton.className = `btn btn-sm btn-outline-${isActive ? 'secondary' : 'success'}`;
            }
        }
    });
}

// Reset user password
function resetPassword(userId) {
    confirmAction(
        'Are you sure you want to reset this user\'s password? A temporary password will be generated.',
        () => {
            fetch(`/admin/users/${userId}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Show password in a secure modal
                    showPasswordResetModal(data.temp_password, data.message);
                    showToast('Password reset successfully', 'success');
                } else {
                    showToast(data.message, 'danger');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('Failed to reset password', 'danger');
            });
        },
        'Reset Password'
    );
}

// Show password reset modal with copy functionality
function showPasswordResetModal(tempPassword, message) {
    const modal = document.getElementById('passwordResetModal') || createPasswordResetModal();
    
    modal.querySelector('#tempPasswordDisplay').value = tempPassword;
    modal.querySelector('#resetMessage').textContent = message;
    
    new bootstrap.Modal(modal).show();
}

function createPasswordResetModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'passwordResetModal';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Password Reset Successful</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-success">
                        <i class="fas fa-check-circle"></i>
                        <span id="resetMessage">Password has been reset successfully!</span>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Temporary Password:</label>
                        <div class="input-group">
                            <input type="text" class="form-control font-monospace" id="tempPasswordDisplay" readonly>
                            <button class="btn btn-outline-secondary" type="button" onclick="copyToClipboard('tempPasswordDisplay')">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                        <div class="form-text">
                            <i class="fas fa-info-circle"></i>
                            Please share this password securely with the user. They will be required to change it on first login.
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

// Copy to clipboard functionality
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    element.select();
    document.execCommand('copy');
    
    // Visual feedback
    const copyButton = element.nextElementSibling;
    const originalText = copyButton.innerHTML;
    copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
    copyButton.classList.add('btn-success');
    copyButton.classList.remove('btn-outline-secondary');
    
    setTimeout(() => {
        copyButton.innerHTML = originalText;
        copyButton.classList.remove('btn-success');
        copyButton.classList.add('btn-outline-secondary');
    }, 2000);
    
    showToast('Password copied to clipboard', 'success');
}

// Delete user
function deleteUser(userId) {
    confirmAction(
        'Are you sure you want to delete this user? This action cannot be undone and will remove all associated data including assessments, appointments, and forum posts.',
        () => {
            fetch(`/admin/users/${userId}/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast(data.message, 'success');
                    
                    // Remove user row from table
                    removeUserFromTable(userId);
                    
                    // Close modal if open
                    const detailsModal = bootstrap.Modal.getInstance(document.getElementById('userDetailsModal'));
                    if (detailsModal) {
                        detailsModal.hide();
                    }
                } else {
                    showToast(data.message, 'danger');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('Failed to delete user', 'danger');
            });
        },
        'Delete User'
    );
}

// Remove user from table
function removeUserFromTable(userId) {
    const table = document.getElementById('usersTable');
    const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    
    Array.from(rows).forEach(row => {
        if (row.cells[0].textContent === userId.toString()) {
            row.remove();
            updateUserCount(
                table.getElementsByTagName('tbody')[0].getElementsByTagName('tr').length,
                table.getElementsByTagName('tbody')[0].getElementsByTagName('tr').length
            );
        }
    });
}

// Send welcome email to user
function sendWelcomeEmail(userId) {
    confirmAction(
        'Send a welcome email to this user with login instructions?',
        () => {
            fetch(`/admin/users/${userId}/send-welcome-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast(data.message, 'success');
                } else {
                    showToast(data.message, 'danger');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('Failed to send welcome email', 'danger');
            });
        },
        'Send Welcome Email'
    );
}

// =============================================================================
// BULK OPERATIONS
// =============================================================================

// Initialize bulk selection functionality
function initializeBulkSelection() {
    const selectAllCheckbox = document.getElementById('selectAllUsers');
    const userCheckboxes = document.querySelectorAll('.user-checkbox');
    const bulkActionBar = document.getElementById('bulkActionBar');
    
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const visibleCheckboxes = Array.from(userCheckboxes).filter(cb => 
                cb.closest('tr').style.display !== 'none'
            );
            
            visibleCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
            
            updateBulkActionVisibility();
        });
    }
    
    userCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateBulkActionVisibility);
    });
}

// Update bulk action bar visibility
function updateBulkActionVisibility() {
    const checkedBoxes = document.querySelectorAll('.user-checkbox:checked');
    const bulkActionBar = document.getElementById('bulkActionBar');
    const selectedCount = document.getElementById('selectedCount');
    
    if (checkedBoxes.length > 0) {
        if (bulkActionBar) {
            bulkActionBar.style.display = 'block';
            if (selectedCount) {
                selectedCount.textContent = `${checkedBoxes.length} selected`;
            }
        }
    } else {
        if (bulkActionBar) {
            bulkActionBar.style.display = 'none';
        }
    }
}

// Get selected user IDs
function getSelectedUsers() {
    const checkedBoxes = document.querySelectorAll('.user-checkbox:checked');
    return Array.from(checkedBoxes).map(cb => cb.value);
}

// Bulk activate users
function bulkActivateUsers() {
    const selectedUsers = getSelectedUsers();
    if (selectedUsers.length === 0) {
        showToast('Please select users to activate', 'warning');
        return;
    }
    
    confirmAction(
        `Activate ${selectedUsers.length} selected user(s)?`,
        () => {
            Promise.all(selectedUsers.map(userId => 
                fetch(`/admin/users/${userId}/toggle-status`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: true })
                })
            ))
            .then(responses => Promise.all(responses.map(r => r.json())))
            .then(results => {
                const successCount = results.filter(r => r.success).length;
                showToast(`${successCount} users activated successfully`, 'success');
                location.reload();
            })
            .catch(error => {
                showToast('Failed to activate some users', 'danger');
            });
        }
    );
}

// Bulk deactivate users
function bulkDeactivateUsers() {
    const selectedUsers = getSelectedUsers();
    if (selectedUsers.length === 0) {
        showToast('Please select users to deactivate', 'warning');
        return;
    }
    
    confirmAction(
        `Deactivate ${selectedUsers.length} selected user(s)? They will not be able to log in.`,
        () => {
            Promise.all(selectedUsers.map(userId => 
                fetch(`/admin/users/${userId}/toggle-status`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: false })
                })
            ))
            .then(responses => Promise.all(responses.map(r => r.json())))
            .then(results => {
                const successCount = results.filter(r => r.success).length;
                showToast(`${successCount} users deactivated successfully`, 'success');
                location.reload();
            })
            .catch(error => {
                showToast('Failed to deactivate some users', 'danger');
            });
        }
    );
}

// Bulk send welcome emails
function bulkSendWelcomeEmails() {
    const selectedUsers = getSelectedUsers();
    if (selectedUsers.length === 0) {
        showToast('Please select users to send emails to', 'warning');
        return;
    }
    
    confirmAction(
        `Send welcome emails to ${selectedUsers.length} selected user(s)?`,
        () => {
            Promise.all(selectedUsers.map(userId => 
                fetch(`/admin/users/${userId}/send-welcome-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                })
            ))
            .then(responses => Promise.all(responses.map(r => r.json())))
            .then(results => {
                const successCount = results.filter(r => r.success).length;
                showToast(`Welcome emails sent to ${successCount} users`, 'success');
            })
            .catch(error => {
                showToast('Failed to send some emails', 'danger');
            });
        }
    );
}

// Clear bulk selection
function clearBulkSelection() {
    const checkboxes = document.querySelectorAll('.user-checkbox');
    const selectAllCheckbox = document.getElementById('selectAllUsers');
    
    checkboxes.forEach(cb => cb.checked = false);
    if (selectAllCheckbox) selectAllCheckbox.checked = false;
    
    updateBulkActionVisibility();
    showToast('Selection cleared', 'info');
}

// =============================================================================
// EXPORT FUNCTIONS
// =============================================================================

// Export users to CSV
function exportUsers() {
    const table = document.getElementById('usersTable');
    if (!table) return;
    
    showToast('Preparing export...', 'info');
    
    let csv = 'ID,Name,Email,Student ID,Course,Year,Status,Phone,Emergency Contact,Emergency Phone,Registered,Last Login\n';
    
    const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    Array.from(rows).forEach(row => {
        if (row.style.display !== 'none') {
            const cells = row.getElementsByTagName('td');
            const data = [
                cells[0].textContent, // ID
                cells[1].textContent.replace(/\n/g, ' ').trim(), // Name
                cells[2].textContent, // Email
                cells[3].textContent, // Student ID
                cells[4].textContent, // Course
                cells[5].textContent, // Year
                cells[6].textContent.trim(), // Status
                'N/A', // Phone (would need to be fetched)
                'N/A', // Emergency Contact (would need to be fetched)
                'N/A', // Emergency Phone (would need to be fetched)
                cells[7].textContent, // Registered
                cells[8].textContent // Last Login
            ];
            csv += data.map(field => `"${field.replace(/"/g, '""')}"`).join(',') + '\n';
        }
    });
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Users exported successfully', 'success');
}

// Export selected users only
function exportSelectedUsers() {
    const selectedUsers = getSelectedUsers();
    if (selectedUsers.length === 0) {
        showToast('Please select users to export', 'warning');
        return;
    }
    
    showToast('Exporting selected users...', 'info');
    
    // Fetch detailed data for selected users
    Promise.all(selectedUsers.map(userId => 
        fetch(`/admin/users/${userId}/details`).then(r => r.json())
    ))
    .then(usersData => {
        let csv = 'ID,Name,Email,Student ID,Course,Year,Status,Phone,Emergency Contact,Emergency Phone,Registered,Last Login,Assessments,Appointments,Forum Posts\n';
        
        usersData.forEach(data => {
            if (data.user) {
                const user = data.user;
                const row = [
                    user.id || '',
                    user.name || '',
                    user.email || '',
                    user.student_id || '',
                    user.course || '',
                    user.year_of_study || '',
                    user.is_active ? 'Active' : 'Inactive',
                    user.phone || 'N/A',
                    user.emergency_contact || 'N/A',
                    user.emergency_phone || 'N/A',
                    user.created_at || '',
                    user.last_login || 'Never',
                    data.assessments_count || 0,
                    data.appointments_count || 0,
                    data.forum_posts_count || 0
                ];
                csv += row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',') + '\n';
            }
        });
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `selected_users_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast(`${selectedUsers.length} users exported successfully`, 'success');
    })
    .catch(error => {
        showToast('Failed to export selected users', 'danger');
    });
}

// Generate user report
function generateUserReport() {
    showToast('Generating user report...', 'info');
    
    const reportData = {
        generatedAt: new Date().toISOString(),
        totalUsers: document.querySelectorAll('#usersTable tbody tr').length,
        activeUsers: document.querySelectorAll('#usersTable tbody tr .badge.bg-success').length,
        inactiveUsers: document.querySelectorAll('#usersTable tbody tr .badge.bg-danger').length,
        recentRegistrations: 0, // Would be calculated from backend
        coursesDistribution: {}, // Would be calculated
        yearDistribution: {} // Would be calculated
    };
    
    // Calculate course distribution
    const courseElements = document.querySelectorAll('#usersTable tbody tr td:nth-child(5)');
    courseElements.forEach(element => {
        const course = element.textContent.trim();
        reportData.coursesDistribution[course] = (reportData.coursesDistribution[course] || 0) + 1;
    });
    
    // Calculate year distribution
    const yearElements = document.querySelectorAll('#usersTable tbody tr td:nth-child(6)');
    yearElements.forEach(element => {
        const year = element.textContent.trim();
        reportData.yearDistribution[year] = (reportData.yearDistribution[year] || 0) + 1;
    });
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `user_report_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('User report generated successfully', 'success');
}

// =============================================================================
// FORM VALIDATION AND SUBMISSION
// =============================================================================

// Initialize form validation
function initializeFormValidation() {
    const addUserForm = document.querySelector('#addUserModal form');
    if (addUserForm) {
        addUserForm.addEventListener('submit', handleAddUserSubmission);
        
        // Real-time validation
        const inputs = addUserForm.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearFieldError);
        });
    }
}

// Handle add user form submission
function handleAddUserSubmission(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Validate form
    if (!validateAddUserForm(form)) {
        return;
    }
    
    showLoading(submitButton, 'Adding User...');
    
    const formData = new FormData(form);
    
    fetch('/admin/users/add', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.redirected) {
            // Form submitted successfully, redirect occurred
            window.location.href = response.url;
        } else {
            return response.text();
        }
    })
    .then(html => {
        if (html) {
            // Check if there are validation errors in the response
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const alerts = tempDiv.querySelectorAll('.alert-danger');
            
            if (alerts.length > 0) {
                hideLoading(submitButton);
                alerts.forEach(alert => {
                    showToast(alert.textContent.trim(), 'danger');
                });
            } else {
                // Success, reload page
                location.reload();
            }
        }
    })
    .catch(error => {
        hideLoading(submitButton);
        console.error('Error:', error);
        showToast('Failed to add user. Please try again.', 'danger');
    });
}

// Validate add user form
function validateAddUserForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, 'This field is required');
            isValid = false;
        }
    });
    
    // Email validation
    const emailField = form.querySelector('[name="email"]');
    if (emailField && emailField.value) {
        if (!isValidCUEAEmail(emailField.value)) {
            showFieldError(emailField, 'Please use a valid CUEA email address');
            isValid = false;
        }
    }
    
    // Password validation
    const passwordField = form.querySelector('[name="temp_password"]');
    if (passwordField && passwordField.value) {
        const passwordValidation = validatePasswordStrength(passwordField.value);
        if (!passwordValidation.isValid) {
            showFieldError(passwordField, passwordValidation.message);
            isValid = false;
        }
    }
    
    return isValid;
}

// Validate individual field
function validateField(event) {
    const field = event.target;
    clearFieldError(field);
    
    if (field.hasAttribute('required') && !field.value.trim()) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    if (field.name === 'email' && field.value) {
        if (!isValidCUEAEmail(field.value)) {
            showFieldError(field, 'Please use a valid CUEA email address');
            return false;
        }
    }
    
    if (field.name === 'temp_password' && field.value) {
        const validation = validatePasswordStrength(field.value);
        if (!validation.isValid) {
            showFieldError(field, validation.message);
            return false;
        }
    }
    
    return true;
}

// Show field error
function showFieldError(field, message) {
    clearFieldError(field);
    
    field.classList.add('is-invalid');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

// Clear field error
function clearFieldError(field) {
    field.classList.remove('is-invalid');
    
    const existingError = field.parentNode.querySelector('.invalid-feedback');
    if (existingError) {
        existingError.remove();
    }
}

// Validate CUEA email
function isValidCUEAEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && (email.endsWith('@cuea.edu') || email.endsWith('@student.cuea.edu'));
}

// Validate password strength
function validatePasswordStrength(password) {
    if (password.length < 8) {
        return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Z]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/\d/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one number' };
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one special character' };
    }
    
    return { isValid: true, message: 'Password is strong' };
}

// =============================================================================
// KEYBOARD SHORTCUTS AND ACCESSIBILITY
// =============================================================================

// Handle keyboard shortcuts
function handleKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
        
        // Ctrl/Cmd + A for select all (when in table area)
        if ((e.ctrlKey || e.metaKey) && e.key === 'a' && e.target.closest('#usersTable')) {
            e.preventDefault();
            const selectAllCheckbox = document.getElementById('selectAllUsers');
            if (selectAllCheckbox) {
                selectAllCheckbox.click();
            }
        }
        
        // Escape to clear search/selection
        if (e.key === 'Escape') {
            const searchInput = document.getElementById('searchInput');
            if (searchInput && searchInput.value) {
                searchInput.value = '';
                initializeUserFilters();
                searchInput.blur();
            } else {
                clearBulkSelection();
            }
        }
        
        // Ctrl/Cmd + E for export
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            exportUsers();
        }
        
        // F5/Ctrl+R for refresh (show toast instead of page reload)
        if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.key === 'r')) {
            e.preventDefault();
            showToast('Refreshing user data...', 'info');
            setTimeout(() => location.reload(), 500);
        }
    });
}

// =============================================================================
// INITIALIZATION AND EVENT HANDLERS
// =============================================================================

// Initialize all user management functionality
document.addEventListener('DOMContentLoaded', function() {
    // Create toast container
    createToastContainer();
    
    // Initialize filters and search
    initializeUserFilters();
    
    // Initialize bulk selection
    initializeBulkSelection();
    
    // Initialize form validation
    initializeFormValidation();
    
    // Handle keyboard shortcuts
    handleKeyboardShortcuts();
    
    // Initialize sorting for table headers
    const sortableHeaders = document.querySelectorAll('#usersTable th[data-sort]');
    sortableHeaders.forEach((header, index) => {
        header.style.cursor = 'pointer';
        header.onclick = () => sortTable(index, header.dataset.sort);
        
        // Add sort icon
        if (!header.querySelector('.sort-icon')) {
            createSortIcon(header);
        }
    });
    
    // Initialize modal cleanup
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('hidden.bs.modal', function() {
            // Clear any form data and errors
            const forms = this.querySelectorAll('form');
            forms.forEach(form => {
                form.reset();
                form.classList.remove('was-validated');
                
                // Clear custom validation errors
                const errorElements = form.querySelectorAll('.invalid-feedback');
                errorElements.forEach(el => el.remove());
                
                const invalidInputs = form.querySelectorAll('.is-invalid');
                invalidInputs.forEach(input => input.classList.remove('is-invalid'));
            });
        });
    });
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Auto-save filter preferences
    const filterInputs = document.querySelectorAll('#searchInput, #statusFilter, #courseFilter, #yearFilter');
    filterInputs.forEach(input => {
        input.addEventListener('change', saveFilterPreferences);
    });
    
    // Load saved filter preferences
    loadFilterPreferences();
    
    showToast('User management loaded successfully', 'success');
});

// Save filter preferences to localStorage
function saveFilterPreferences() {
    const preferences = {
        search: document.getElementById('searchInput')?.value || '',
        status: document.getElementById('statusFilter')?.value || '',
        course: document.getElementById('courseFilter')?.value || '',
        year: document.getElementById('yearFilter')?.value || ''
    };
    
    localStorage.setItem('userFilterPreferences', JSON.stringify(preferences));
}

// Load filter preferences from localStorage
function loadFilterPreferences() {
    try {
        const preferences = JSON.parse(localStorage.getItem('userFilterPreferences') || '{}');
        
        if (preferences.search) {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.value = preferences.search;
        }
        
        if (preferences.status) {
            const statusFilter = document.getElementById('statusFilter');
            if (statusFilter) statusFilter.value = preferences.status;
        }
        
        if (preferences.course) {
            const courseFilter = document.getElementById('courseFilter');
            if (courseFilter) courseFilter.value = preferences.course;
        }
        
        if (preferences.year) {
            const yearFilter = document.getElementById('yearFilter');
            if (yearFilter) yearFilter.value = preferences.year;
        }
        
        // Apply filters if any preferences were loaded
        if (Object.values(preferences).some(val => val)) {
            setTimeout(initializeUserFilters, 100);
        }
    } catch (error) {
        console.error('Failed to load filter preferences:', error);
    }
}

// Global functions for button onclick handlers
window.userManagementFunctions = {
    viewUser,
    toggleUserStatus,
    resetPassword,
    deleteUser,
    sendWelcomeEmail,
    generatePassword,
    clearFilters,
    exportUsers,
    exportSelectedUsers,
    generateUserReport,
    bulkActivateUsers,
    bulkDeactivateUsers,
    bulkSendWelcomeEmails,
    clearBulkSelection,
    sortTable,
    openAdvancedSearch,
    copyToClipboard
};

// End of admin-users.js


// Admin Counselor Management JavaScript - CUEA MindConnect

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Show toast notification
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    const toastId = 'toast-' + Date.now();
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.id = toastId;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Create toast container if it doesn't exist
function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '1055';
    document.body.appendChild(container);
    return container;
}

// Confirm dialog
function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// Generate random password
function generateRandomPassword(length = 12) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
}

// Show loading spinner
function showLoading(element) {
    const spinner = '<div class="spinner-border spinner-border-sm me-2" role="status"></div>';
    element.innerHTML = spinner + element.innerHTML;
    element.disabled = true;
}

// Hide loading spinner
function hideLoading(element, originalText) {
    element.innerHTML = originalText;
    element.disabled = false;
}

// =============================================================================
// COUNSELOR MANAGEMENT FUNCTIONS
// =============================================================================
// =============================================================================
// COUNSELOR MANAGEMENT JAVASCRIPT FUNCTIONS
// Add these to your admin.js file or create admin-counselors.js
// =============================================================================

// Initialize counselor filters (search and filter functionality)
function initializeCounselorFilters() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const specializationFilter = document.getElementById('specializationFilter');
    const table = document.getElementById('counselorsTable');

    if (!table) return;

    function filterTable() {
        const searchTerm = searchInput?.value.toLowerCase() || '';
        const statusValue = statusFilter?.value || '';
        const specializationValue = specializationFilter?.value || '';
        
        const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
        
        Array.from(rows).forEach(row => {
            const name = row.cells[1].textContent.toLowerCase();
            const email = row.cells[2].textContent.toLowerCase();
            const specialization = row.cells[3].textContent;
            const status = row.cells[6].textContent.toLowerCase();
            
            const matchesSearch = name.includes(searchTerm) || email.includes(searchTerm);
            const matchesStatus = !statusValue || status.includes(statusValue);
            const matchesSpecialization = !specializationValue || specialization.includes(specializationValue);
            
            row.style.display = matchesSearch && matchesStatus && matchesSpecialization ? '' : 'none';
        });
    }

    searchInput?.addEventListener('input', filterTable);
    statusFilter?.addEventListener('change', filterTable);
    specializationFilter?.addEventListener('change', filterTable);
}

// Generate password for counselor form
function generateCounselorPassword() {
    const passwordField = document.getElementById('counselorTempPassword');
    if (passwordField) {
        const password = generateRandomPassword();
        passwordField.value = password;
        passwordField.type = 'text'; // Show generated password
        
        // Hide password after 3 seconds
        setTimeout(() => {
            passwordField.type = 'password';
        }, 3000);
    }
}

// View counselor details
function viewCounselor(counselorId) {
    fetch(`/admin/counselors/${counselorId}/details`)
        .then(response => response.json())
        .then(data => {
            const modal = document.getElementById('counselorDetailsModal');
            const content = document.getElementById('counselorDetailsContent');
            
            content.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <h6>Personal Information</h6>
                        <table class="table table-sm">
                            <tr><td><strong>Name:</strong></td><td>${data.counselor.name}</td></tr>
                            <tr><td><strong>Email:</strong></td><td>${data.counselor.email}</td></tr>
                            <tr><td><strong>Username:</strong></td><td>${data.counselor.username}</td></tr>
                            <tr><td><strong>Phone:</strong></td><td>${data.counselor.phone || 'N/A'}</td></tr>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <h6>Professional Information</h6>
                        <table class="table table-sm">
                            <tr><td><strong>Specialization:</strong></td><td>${data.counselor.specialization || 'General'}</td></tr>
                            <tr><td><strong>License:</strong></td><td>${data.counselor.license_number || 'N/A'}</td></tr>
                            <tr><td><strong>Status:</strong></td><td>
                                <span class="badge ${data.counselor.is_active ? 'bg-success' : 'bg-danger'}">
                                    ${data.counselor.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </td></tr>
                            <tr><td><strong>Joined:</strong></td><td>${data.counselor.created_at}</td></tr>
                        </table>
                    </div>
                </div>
                <div class="row mt-3">
                    <div class="col-md-6">
                        <h6>Performance Statistics</h6>
                        <table class="table table-sm">
                            <tr><td><strong>Total Appointments:</strong></td><td>${data.statistics.total_appointments}</td></tr>
                            <tr><td><strong>Completed:</strong></td><td>${data.statistics.completed_appointments}</td></tr>
                            <tr><td><strong>Completion Rate:</strong></td><td>${data.statistics.completion_rate.toFixed(1)}%</td></tr>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <h6>Recent Appointments</h6>
                        <div class="table-responsive" style="max-height: 200px; overflow-y: auto;">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Student</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${data.recent_appointments.map(apt => `
                                        <tr>
                                            <td>${apt.date}</td>
                                            <td><span class="badge bg-${apt.status === 'completed' ? 'success' : apt.status === 'cancelled' ? 'danger' : 'primary'}">${apt.status}</span></td>
                                            <td>${apt.user_name}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
            
            new bootstrap.Modal(modal).show();
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Failed to load counselor details', 'danger');
        });
}

// Edit counselor
function editCounselor(counselorId) {
    fetch(`/admin/counselors/${counselorId}/edit`)
        .then(response => response.json())
        .then(data => {
            const modal = document.getElementById('editCounselorModal');
            const content = document.getElementById('editCounselorContent');
            
            content.innerHTML = `
                <input type="hidden" name="counselor_id" value="${data.id}">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">First Name *</label>
                            <input type="text" class="form-control" name="first_name" value="${data.first_name}" required>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">Last Name *</label>
                            <input type="text" class="form-control" name="last_name" value="${data.last_name}" required>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">Email *</label>
                            <input type="email" class="form-control" name="email" value="${data.email}" required>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">Phone</label>
                            <input type="tel" class="form-control" name="phone" value="${data.phone}">
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">Specialization</label>
                            <select class="form-select" name="specialization">
                                <option value="">Select Specialization</option>
                                <option value="Clinical Psychology" ${data.specialization === 'Clinical Psychology' ? 'selected' : ''}>Clinical Psychology</option>
                                <option value="Counseling Psychology" ${data.specialization === 'Counseling Psychology' ? 'selected' : ''}>Counseling Psychology</option>
                                <option value="Educational Psychology" ${data.specialization === 'Educational Psychology' ? 'selected' : ''}>Educational Psychology</option>
                                <option value="Family Therapy" ${data.specialization === 'Family Therapy' ? 'selected' : ''}>Family Therapy</option>
                                <option value="Addiction Counseling" ${data.specialization === 'Addiction Counseling' ? 'selected' : ''}>Addiction Counseling</option>
                                <option value="Trauma Counseling" ${data.specialization === 'Trauma Counseling' ? 'selected' : ''}>Trauma Counseling</option>
                                <option value="Career Counseling" ${data.specialization === 'Career Counseling' ? 'selected' : ''}>Career Counseling</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">License Number</label>
                            <input type="text" class="form-control" name="license_number" value="${data.license_number}">
                        </div>
                    </div>
                </div>
            `;
            
            new bootstrap.Modal(modal).show();
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Failed to load counselor data', 'danger');
        });
}

// Handle edit counselor form submission
function handleEditCounselorForm() {
    const form = document.getElementById('editCounselorForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            const counselorId = data.counselor_id;
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            showLoading(submitBtn);
            
            fetch(`/admin/counselors/${counselorId}/edit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                hideLoading(submitBtn, originalText);
                
                if (data.success) {
                    showToast(data.message, 'success');
                    bootstrap.Modal.getInstance(document.getElementById('editCounselorModal')).hide();
                    location.reload();
                } else {
                    showToast(data.message, 'danger');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                hideLoading(submitBtn, originalText);
                showToast('Failed to update counselor', 'danger');
            });
        });
    }
}

// Toggle counselor status (activate/deactivate)
function toggleCounselorStatus(counselorId, newStatus) {
    const action = newStatus ? 'activate' : 'deactivate';
    
    confirmAction(`Are you sure you want to ${action} this counselor?`, () => {
        fetch(`/admin/counselors/${counselorId}/toggle-status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast(data.message, 'success');
                location.reload();
            } else {
                showToast(data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Failed to update counselor status', 'danger');
        });
    });
}

// Reset counselor password
function resetCounselorPassword(counselorId) {
    confirmAction('Are you sure you want to reset this counselor\'s password?', () => {
        fetch(`/admin/counselors/${counselorId}/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const message = `${data.message}\nTemporary password: ${data.temp_password}`;
                alert(message); // Use alert to show the password
                showToast('Password reset successfully', 'success');
            } else {
                showToast(data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Failed to reset password', 'danger');
        });
    });
}

// Export counselors to CSV
function exportCounselors() {
    const table = document.getElementById('counselorsTable');
    if (!table) return;
    
    let csv = 'ID,Name,Email,Specialization,License,Phone,Status,Total Appointments,Completed,Joined\n';
    
    const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    Array.from(rows).forEach(row => {
        if (row.style.display !== 'none') {
            const cells = row.getElementsByTagName('td');
            const data = [
                cells[0].textContent, // ID
                cells[1].textContent.replace(/\n/g, ' ').trim(), // Name
                cells[2].textContent, // Email
                cells[3].textContent, // Specialization
                cells[4].textContent, // License
                cells[5].textContent, // Phone
                cells[6].textContent.trim(), // Status
                cells[7].textContent.split('/')[1] || '0', // Total appointments
                cells[7].textContent.split('/')[0] || '0', // Completed
                cells[8].textContent // Joined date
            ];
            csv += data.map(field => `"${field}"`).join(',') + '\n';
        }
    });
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'counselors_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    showToast('Counselors exported successfully', 'success');
}

// =============================================================================
// INITIALIZATION FOR COUNSELOR PAGE
// =============================================================================

// Add this to your DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    // Only run on counselor management page
    if (window.location.pathname.includes('admin/counselors')) {
        // Initialize counselor filters
        initializeCounselorFilters();
        
        // Handle edit counselor form
        handleEditCounselorForm();
        
        // Initialize modal events
        const addCounselorModal = document.getElementById('addCounselorModal');
        if (addCounselorModal) {
            addCounselorModal.addEventListener('hidden.bs.modal', function() {
                const form = this.querySelector('form');
                if (form) {
                    form.reset();
                    form.classList.remove('was-validated');
                }
            });
        }
        
        const editCounselorModal = document.getElementById('editCounselorModal');
        if (editCounselorModal) {
            editCounselorModal.addEventListener('hidden.bs.modal', function() {
                const content = document.getElementById('editCounselorContent');
                if (content) {
                    content.innerHTML = '';
                }
            });
        }
    }
});


//===============================================================================
// END OF ADMIN COUNSELOR MANAGEMENT JAVASCRIPT
//===============================================================================


// Admin Appointment Management JavaScript - CUEA MindConnect

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Show toast notification
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    const toastId = 'toast-' + Date.now();
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.id = toastId;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Create toast container if it doesn't exist
function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '1055';
    document.body.appendChild(container);
    return container;
}

// Confirm dialog
function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// Show loading spinner
function showLoading(element) {
    const spinner = '<div class="spinner-border spinner-border-sm me-2" role="status"></div>';
    element.innerHTML = spinner + element.innerHTML;
    element.disabled = true;
}

// Hide loading spinner
function hideLoading(element, originalText) {
    element.innerHTML = originalText;
    element.disabled = false;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Get current date in YYYY-MM-DD format
function getCurrentDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// Get current time in HH:MM format
function getCurrentTime() {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' + 
           now.getMinutes().toString().padStart(2, '0');
}

// =============================================================================
// APPOINTMENT MANAGEMENT FUNCTIONS
// =============================================================================

class AppointmentManager {
    constructor() {
        this.appointments = [];
        this.counselors = [];
        this.students = [];
        this.selectedAppointments = new Set();
        this.currentFilters = {
            search: '',
            status: '',
            counselor: '',
            date: ''
        };
        this.lastUpdateCheck = null;
        this.autoRefreshInterval = null;
        
        this.init();
    }

    // ==========================================================================
    // INITIALIZATION
    // ==========================================================================

    async init() {
        try {
            console.log('Initializing Appointment Manager...');
            this.showLoading();
            
            // Load initial data
            await this.loadInitialData();
            
            // Bind all events
            this.bindEvents();
            
            // Setup auto-refresh
            this.setupAutoRefresh();
            
            // Initialize UI components
            this.initializeUIComponents();
            
            this.hideLoading();
            console.log('Appointment Manager initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Appointment Manager:', error);
            this.showToast('Failed to initialize appointment system', 'error');
            this.hideLoading();
        }
    }

    async loadInitialData() {
        try {
            const promises = [
                this.loadAppointments(),
                this.loadCounselors(),
                this.loadStudents()
            ];
            
            await Promise.all(promises);
            
            this.updateStatistics();
            this.populateDropdowns();
            this.applyFilters();
            
        } catch (error) {
            console.error('Failed to load initial data:', error);
            throw error;
        }
    }

    // ==========================================================================
    // DATA LOADING METHODS
    // ==========================================================================

    async loadAppointments() {
        try {
            const response = await fetch('/api/admin/appointments');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to load appointments');
            }
            
            this.appointments = data.appointments || [];
            this.renderAppointmentsTable();
            
            console.log(`Loaded ${this.appointments.length} appointments`);
            
        } catch (error) {
            console.error('Error loading appointments:', error);
            this.showToast('Failed to load appointments', 'error');
            throw error;
        }
    }

    async loadCounselors() {
        try {
            const response = await fetch('/api/admin/counselors');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to load counselors');
            }
            
            this.counselors = data.counselors || [];
            console.log(`Loaded ${this.counselors.length} counselors`);
            
        } catch (error) {
            console.error('Error loading counselors:', error);
            this.counselors = []; // Fallback to empty array
        }
    }

    async loadStudents() {
        try {
            const response = await fetch('/api/admin/students');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to load students');
            }
            
            this.students = data.students || [];
            console.log(`Loaded ${this.students.length} students`);
            
        } catch (error) {
            console.error('Error loading students:', error);
            this.students = []; // Fallback to empty array
        }
    }

    // ==========================================================================
    // EVENT BINDING
    // ==========================================================================

    bindEvents() {
        // Search and filter events
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', 
                this.debounce(this.handleSearch.bind(this), 300));
        }
        
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', this.handleStatusFilter.bind(this));
        }
        
        const counselorFilter = document.getElementById('counselorFilter');
        if (counselorFilter) {
            counselorFilter.addEventListener('change', this.handleCounselorFilter.bind(this));
        }
        
        const dateFilter = document.getElementById('dateFilter');
        if (dateFilter) {
            dateFilter.addEventListener('change', this.handleDateFilter.bind(this));
        }

        // Selection events
        const selectAll = document.getElementById('selectAll');
        if (selectAll) {
            selectAll.addEventListener('change', this.handleSelectAll.bind(this));
        }
        
        const selectAllHeader = document.getElementById('selectAllHeader');
        if (selectAllHeader) {
            selectAllHeader.addEventListener('change', this.handleSelectAll.bind(this));
        }

        // Form submissions
        const scheduleForm = document.getElementById('scheduleAppointmentForm');
        if (scheduleForm) {
            scheduleForm.addEventListener('submit', this.handleScheduleAppointment.bind(this));
        }
        
        const assignForm = document.getElementById('assignCounselorForm');
        if (assignForm) {
            assignForm.addEventListener('submit', this.handleAssignCounselor.bind(this));
        }
        
        const rescheduleForm = document.getElementById('rescheduleForm');
        if (rescheduleForm) {
            rescheduleForm.addEventListener('submit', this.handleReschedule.bind(this));
        }

        // Modal events
        const scheduleModal = document.getElementById('scheduleAppointmentModal');
        if (scheduleModal) {
            scheduleModal.addEventListener('shown.bs.modal', this.setupScheduleModal.bind(this));
            scheduleModal.addEventListener('hidden.bs.modal', this.resetForm.bind(this));
        }
        
        const assignModal = document.getElementById('assignCounselorModal');
        if (assignModal) {
            assignModal.addEventListener('hidden.bs.modal', this.resetForm.bind(this));
        }
        
        const rescheduleModal = document.getElementById('rescheduleModal');
        if (rescheduleModal) {
            rescheduleModal.addEventListener('hidden.bs.modal', this.resetForm.bind(this));
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
    }

    // ==========================================================================
    // EVENT HANDLERS
    // ==========================================================================

    handleSearch(event) {
        this.currentFilters.search = event.target.value.toLowerCase();
        this.applyFilters();
    }

    handleStatusFilter(event) {
        this.currentFilters.status = event.target.value;
        this.applyFilters();
    }

    handleCounselorFilter(event) {
        this.currentFilters.counselor = event.target.value;
        this.applyFilters();
    }

    handleDateFilter(event) {
        this.currentFilters.date = event.target.value;
        this.applyFilters();
    }

    handleSelectAll(event) {
        const isChecked = event.target.checked;
        const checkboxes = document.querySelectorAll('.appointment-checkbox');
        
        checkboxes.forEach(checkbox => {
            if (checkbox.closest('tr').style.display !== 'none') {
                checkbox.checked = isChecked;
                const appointmentId = parseInt(checkbox.value);
                
                if (isChecked) {
                    this.selectedAppointments.add(appointmentId);
                } else {
                    this.selectedAppointments.delete(appointmentId);
                }
            }
        });
        
        this.updateBulkActionBar();
        this.updateSelectAllState();
    }

    handleAppointmentSelection(event) {
        const appointmentId = parseInt(event.target.value);
        
        if (event.target.checked) {
            this.selectedAppointments.add(appointmentId);
        } else {
            this.selectedAppointments.delete(appointmentId);
        }
        
        this.updateBulkActionBar();
        this.updateSelectAllState();
    }

    handleKeyboardShortcuts(event) {
        // Ctrl/Cmd + K for search
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
        
        // Escape to close modals and clear selection
        if (event.key === 'Escape') {
            this.closeAllModals();
            this.clearSelection();
        }
        
        // F5 to refresh
        if (event.key === 'F5') {
            event.preventDefault();
            this.refreshAppointments();
        }
        
        // Delete key to cancel selected appointments
        if (event.key === 'Delete' && this.selectedAppointments.size > 0) {
            event.preventDefault();
            this.bulkCancel();
        }
    }

    // ==========================================================================
    // FORM HANDLERS
    // ==========================================================================

    async handleScheduleAppointment(event) {
        event.preventDefault();
        
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            this.showButtonLoading(submitBtn);
            
            const formData = new FormData(event.target);
            const data = Object.fromEntries(formData.entries());
            
            // Validate form data
            if (!this.validateScheduleForm(data)) {
                return;
            }
            
            const response = await fetch('/api/admin/appointments/schedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (result.success) {
                this.showToast('Appointment scheduled successfully!', 'success');
                this.closeModal('scheduleAppointmentModal');
                await this.loadAppointments();
                event.target.reset();
            } else {
                this.showToast(result.message || 'Failed to schedule appointment', 'error');
            }
            
        } catch (error) {
            console.error('Error scheduling appointment:', error);
            this.showToast('Failed to schedule appointment', 'error');
        } finally {
            this.hideButtonLoading(submitBtn, originalText);
        }
    }

    async handleAssignCounselor(event) {
        event.preventDefault();
        
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            this.showButtonLoading(submitBtn);
            
            const formData = new FormData(event.target);
            const data = Object.fromEntries(formData.entries());
            const appointmentId = data.appointment_id;
            
            if (!appointmentId || !data.counselor_id) {
                this.showToast('Please select a counselor', 'warning');
                return;
            }
            
            const response = await fetch(`/api/admin/appointments/${appointmentId}/assign-counselor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (result.success) {
                this.showToast('Counselor assigned successfully!', 'success');
                this.closeModal('assignCounselorModal');
                await this.loadAppointments();
                event.target.reset();
            } else {
                this.showToast(result.message || 'Failed to assign counselor', 'error');
            }
            
        } catch (error) {
            console.error('Error assigning counselor:', error);
            this.showToast('Failed to assign counselor', 'error');
        } finally {
            this.hideButtonLoading(submitBtn, originalText);
        }
    }

    async handleReschedule(event) {
        event.preventDefault();
        
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            this.showButtonLoading(submitBtn);
            
            const formData = new FormData(event.target);
            const data = Object.fromEntries(formData.entries());
            const appointmentId = data.appointment_id;
            
            // Validate future date
            const selectedDateTime = new Date(data.new_date + ' ' + data.new_time);
            const now = new Date();
            
            if (selectedDateTime <= now) {
                this.showToast('Please select a future date and time', 'warning');
                return;
            }
            
            const response = await fetch(`/api/admin/appointments/${appointmentId}/reschedule`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (result.success) {
                this.showToast('Appointment rescheduled successfully!', 'success');
                this.closeModal('rescheduleModal');
                await this.loadAppointments();
                event.target.reset();
            } else {
                this.showToast(result.message || 'Failed to reschedule appointment', 'error');
            }
            
        } catch (error) {
            console.error('Error rescheduling appointment:', error);
            this.showToast('Failed to reschedule appointment', 'error');
        } finally {
            this.hideButtonLoading(submitBtn, originalText);
        }
    }

    // ==========================================================================
    // APPOINTMENT ACTIONS
    // ==========================================================================

    async approveAppointment(appointmentId) {
        if (!await this.confirmAction('Approve this appointment request?')) return;
        
        try {
            const response = await fetch(`/api/admin/appointments/${appointmentId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                }
            });

            const result = await response.json();
            
            if (result.success) {
                this.showToast('Appointment approved successfully!', 'success');
                await this.loadAppointments();
            } else {
                this.showToast(result.message || 'Failed to approve appointment', 'error');
            }
            
        } catch (error) {
            console.error('Error approving appointment:', error);
            this.showToast('Failed to approve appointment', 'error');
        }
    }

    assignCounselor(appointmentId) {
        document.getElementById('assignAppointmentId').value = appointmentId;
        this.showModal('assignCounselorModal');
    }

    rescheduleAppointment(appointmentId) {
        document.getElementById('rescheduleAppointmentId').value = appointmentId;
        
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        const newDateInput = document.getElementById('newDate');
        const newTimeInput = document.getElementById('newTime');
        
        if (newDateInput) {
            newDateInput.min = today;
            newDateInput.value = today;
        }
        
        if (newTimeInput) {
            const now = new Date();
            const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                               now.getMinutes().toString().padStart(2, '0');
            newTimeInput.value = currentTime;
        }
        
        this.showModal('rescheduleModal');
    }

    async markCompleted(appointmentId) {
        if (!await this.confirmAction('Mark this appointment as completed?')) return;
        
        try {
            const response = await fetch(`/api/admin/appointments/${appointmentId}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                }
            });

            const result = await response.json();
            
            if (result.success) {
                this.showToast('Appointment marked as completed!', 'success');
                await this.loadAppointments();
            } else {
                this.showToast(result.message || 'Failed to update appointment', 'error');
            }
            
        } catch (error) {
            console.error('Error completing appointment:', error);
            this.showToast('Failed to update appointment', 'error');
        }
    }

    async cancelAppointment(appointmentId) {
        const reason = await this.promptForReason('Cancel Appointment', 'Please provide a reason for cancellation:');
        if (reason === null) return; // User cancelled
        
        try {
            const response = await fetch(`/api/admin/appointments/${appointmentId}/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: JSON.stringify({ reason })
            });

            const result = await response.json();
            
            if (result.success) {
                this.showToast('Appointment cancelled successfully!', 'success');
                await this.loadAppointments();
            } else {
                this.showToast(result.message || 'Failed to cancel appointment', 'error');
            }
            
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            this.showToast('Failed to cancel appointment', 'error');
        }
    }

    async viewAppointment(appointmentId) {
        try {
            const response = await fetch(`/api/admin/appointments/${appointmentId}/details`);
            const data = await response.json();
            
            if (data.success) {
                this.renderAppointmentDetails(data.appointment);
                this.showModal('appointmentDetailsModal');
            } else {
                this.showToast('Failed to load appointment details', 'error');
            }
            
        } catch (error) {
            console.error('Error loading appointment details:', error);
            this.showToast('Failed to load appointment details', 'error');
        }
    }

    // ==========================================================================
    // BULK OPERATIONS
    // ==========================================================================

    async bulkApprove() {
        if (this.selectedAppointments.size === 0) {
            this.showToast('Please select appointments to approve', 'warning');
            return;
        }
        
        const message = `Approve ${this.selectedAppointments.size} selected appointment(s)?`;
        if (!await this.confirmAction(message)) return;
        
        try {
            const promises = Array.from(this.selectedAppointments).map(id =>
                fetch(`/api/admin/appointments/${id}/approve`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'X-CSRFToken': this.getCSRFToken()
                    }
                })
            );
            
            const responses = await Promise.all(promises);
            const results = await Promise.all(responses.map(r => r.json()));
            
            const successCount = results.filter(r => r.success).length;
            const failCount = results.length - successCount;
            
            if (successCount > 0) {
                this.showToast(`${successCount} appointment(s) approved successfully!`, 'success');
            }
            
            if (failCount > 0) {
                this.showToast(`${failCount} appointment(s) failed to approve`, 'warning');
            }
            
            this.clearSelection();
            await this.loadAppointments();
            
        } catch (error) {
            console.error('Error in bulk approve:', error);
            this.showToast('Failed to approve some appointments', 'error');
        }
    }

    async bulkReschedule() {
        if (this.selectedAppointments.size === 0) {
            this.showToast('Please select appointments to reschedule', 'warning');
            return;
        }
        
        // For now, show a message that bulk reschedule needs individual handling
        this.showToast(`Bulk reschedule for ${this.selectedAppointments.size} appointments requires individual rescheduling due to different timing needs. Please reschedule appointments one by one.`, 'info');
    }

    async bulkCancel() {
        if (this.selectedAppointments.size === 0) {
            this.showToast('Please select appointments to cancel', 'warning');
            return;
        }
        
        const reason = await this.promptForReason('Bulk Cancel', `Cancel ${this.selectedAppointments.size} selected appointment(s)?\n\nPlease provide a reason:`);
        if (reason === null) return;
        
        try {
            const promises = Array.from(this.selectedAppointments).map(id =>
                fetch(`/api/admin/appointments/${id}/cancel`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'X-CSRFToken': this.getCSRFToken()
                    },
                    body: JSON.stringify({ reason })
                })
            );
            
            const responses = await Promise.all(promises);
            const results = await Promise.all(responses.map(r => r.json()));
            
            const successCount = results.filter(r => r.success).length;
            const failCount = results.length - successCount;
            
            if (successCount > 0) {
                this.showToast(`${successCount} appointment(s) cancelled successfully!`, 'success');
            }
            
            if (failCount > 0) {
                this.showToast(`${failCount} appointment(s) failed to cancel`, 'warning');
            }
            
            this.clearSelection();
            await this.loadAppointments();
            
        } catch (error) {
            console.error('Error in bulk cancel:', error);
            this.showToast('Failed to cancel some appointments', 'error');
        }
    }

    // ==========================================================================
    // UI RENDERING
    // ==========================================================================

    renderAppointmentsTable() {
        const tbody = document.getElementById('appointmentsTableBody');
        if (!tbody) {
            console.error('Appointments table body not found');
            return;
        }

        tbody.innerHTML = '';

        if (this.appointments.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center py-4">
                        <div class="text-muted">
                            <i class="fas fa-calendar-times fa-3x mb-3"></i>
                            <p class="mb-0">No appointments found</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        this.appointments.forEach(appointment => {
            const row = this.createAppointmentRow(appointment);
            tbody.appendChild(row);
        });

        // Update appointment count
        const countElement = document.getElementById('appointmentCount');
        if (countElement) {
            countElement.textContent = this.appointments.length;
        }
    }

    createAppointmentRow(appointment) {
        const row = document.createElement('tr');
        row.className = `appointment-row ${appointment.status}`;
        row.dataset.appointmentId = appointment.id;

        const priority = this.calculatePriority(appointment);
        const priorityClass = priority === 'High' ? 'danger' : priority === 'Medium' ? 'warning' : 'success';

        // Format student initials
        const studentInitials = appointment.student.name.split(' ')
            .map(n => n.charAt(0).toUpperCase())
            .join('');

        // Format counselor initials if assigned
        const counselorInitials = appointment.counselor 
            ? appointment.counselor.name.split(' ').map(n => n.charAt(0).toUpperCase()).join('')
            : '';

        row.innerHTML = `
            <td>
                <input type="checkbox" class="form-check-input appointment-checkbox" value="${appointment.id}">
            </td>
            <td>
                <span class="badge bg-light text-dark">#${appointment.id}</span>
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="avatar-circle me-2">
                        ${studentInitials}
                    </div>
                    <div>
                        <div class="fw-bold">${this.escapeHtml(appointment.student.name)}</div>
                        <small class="text-muted">${this.escapeHtml(appointment.student.student_id)} - ${this.escapeHtml(appointment.student.course)}</small>
                    </div>
                </div>
            </td>
            <td>
                <div class="fw-bold">${this.escapeHtml(appointment.topic || 'General Counseling')}</div>
                <small class="text-muted">${appointment.notes ? this.escapeHtml(appointment.notes.substring(0, 50)) + '...' : 'No additional notes'}</small>
            </td>
            <td>
                <div class="fw-bold">${this.formatDate(appointment.requested_date)}</div>
                <small class="text-muted">${this.formatTime(appointment.requested_date)}</small>
            </td>
            <td>
                <span class="badge bg-info text-white">${appointment.duration}m</span>
            </td>
            <td>
                ${appointment.counselor ? `
                    <div class="d-flex align-items-center">
                        <div class="avatar-circle me-2">
                            ${counselorInitials}
                        </div>
                        <div>
                            <div class="fw-bold">${this.escapeHtml(appointment.counselor.name)}</div>
                            <small class="text-muted">${this.escapeHtml(appointment.counselor.specialization || 'General')}</small>
                        </div>
                    </div>
                ` : '<span class="text-muted"><i class="fas fa-user-slash me-1"></i>Not assigned</span>'}
            </td>
            <td>
                <span class="status-badge bg-${this.getStatusColor(appointment.status)} text-white">
                    <i class="fas ${this.getStatusIcon(appointment.status)} me-1"></i>
                    ${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
            </td>
            <td>
                <span class="priority-badge badge bg-${priorityClass}">
                    <i class="fas ${this.getPriorityIcon(priority)} me-1"></i>
                    ${priority}
                </span>
            </td>
            <td>
                <div class="btn-group" role="group">
                    ${this.renderActionButtons(appointment)}
                </div>
            </td>
        `;

        // Add event listener for checkbox
        const checkbox = row.querySelector('.appointment-checkbox');
        checkbox.addEventListener('change', this.handleAppointmentSelection.bind(this));

        return row;
    }

    renderActionButtons(appointment) {
        let buttons = `
            <button type="button" class="btn btn-sm btn-outline-primary" 
                    onclick="appointmentManager.viewAppointment(${appointment.id})" 
                    title="View Details" data-bs-toggle="tooltip">
                <i class="fas fa-eye"></i>
            </button>
        `;

        switch (appointment.status) {
            case 'pending':
                buttons += `
                    <button type="button" class="btn btn-sm btn-outline-success"
                            onclick="appointmentManager.approveAppointment(${appointment.id})" 
                            title="Approve" data-bs-toggle="tooltip">
                        <i class="fas fa-check"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-info"
                            onclick="appointmentManager.assignCounselor(${appointment.id})" 
                            title="Assign Counselor" data-bs-toggle="tooltip">
                        <i class="fas fa-user-md"></i>
                    </button>
                `;
                break;
                
            case 'approved':
                buttons += `
                    <button type="button" class="btn btn-sm btn-outline-info"
                            onclick="appointmentManager.assignCounselor(${appointment.id})" 
                            title="Assign Counselor" data-bs-toggle="tooltip">
                        <i class="fas fa-user-md"></i>
                    </button>
                `;
                break;
                
            case 'assigned':
            case 'scheduled':
                buttons += `
                    <button type="button" class="btn btn-sm btn-outline-warning"
                            onclick="appointmentManager.rescheduleAppointment(${appointment.id})" 
                            title="Reschedule" data-bs-toggle="tooltip">
                        <i class="fas fa-calendar-alt"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-success"
                            onclick="appointmentManager.markCompleted(${appointment.id})" 
                            title="Mark Completed" data-bs-toggle="tooltip">
                        <i class="fas fa-check-circle"></i>
                    </button>
                `;
                break;
        }

        // Add cancel button for non-completed/cancelled appointments
        if (!['completed', 'cancelled'].includes(appointment.status)) {
            buttons += `
                <button type="button" class="btn btn-sm btn-outline-danger"
                        onclick="appointmentManager.cancelAppointment(${appointment.id})" 
                        title="Cancel" data-bs-toggle="tooltip">
                    <i class="fas fa-times"></i>
                </button>
            `;
        }

        return buttons;
    }

    renderAppointmentDetails(appointment) {
        const content = document.getElementById('appointmentDetailsContent');
        if (!content) return;
        
        content.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6 class="fw-bold text-primary mb-3">
                        <i class="fas fa-calendar-check me-2"></i>
                        Appointment Information
                    </h6>
                    <table class="table table-sm table-borderless">
                        <tr><td class="fw-bold text-muted">ID:</td><td>#${appointment.id}</td></tr>
                        <tr><td class="fw-bold text-muted">Topic:</td><td>${this.escapeHtml(appointment.topic || 'General Counseling')}</td></tr>
                        <tr><td class="fw-bold text-muted">Requested Date:</td><td>${this.formatDateTime(appointment.requested_date)}</td></tr>
                        <tr><td class="fw-bold text-muted">Scheduled Date:</td><td>${appointment.scheduled_date ? this.formatDateTime(appointment.scheduled_date) : 'Not scheduled'}</td></tr>
                        <tr><td class="fw-bold text-muted">Duration:</td><td>${appointment.duration} minutes</td></tr>
                        <tr><td class="fw-bold text-muted">Status:</td><td>
                            <span class="status-badge bg-${this.getStatusColor(appointment.status)} text-white">
                                <i class="fas ${this.getStatusIcon(appointment.status)} me-1"></i>
                                ${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                        </td></tr>
                        <tr><td class="fw-bold text-muted">Created:</td><td>${this.formatDateTime(appointment.created_at)}</td></tr>
                        ${appointment.completed_at ? `<tr><td class="fw-bold text-muted">Completed:</td><td>${this.formatDateTime(appointment.completed_at)}</td></tr>` : ''}
                    </table>
                </div>
                <div class="col-md-6">
                    <h6 class="fw-bold text-primary mb-3">
                        <i class="fas fa-user-graduate me-2"></i>
                        Student Information
                    </h6>
                    <table class="table table-sm table-borderless">
                        <tr><td class="fw-bold text-muted">Name:</td><td>${this.escapeHtml(appointment.student.name)}</td></tr>
                        <tr><td class="fw-bold text-muted">Email:</td><td>${this.escapeHtml(appointment.student.email)}</td></tr>
                        <tr><td class="fw-bold text-muted">Student ID:</td><td>${this.escapeHtml(appointment.student.student_id)}</td></tr>
                        <tr><td class="fw-bold text-muted">Course:</td><td>${this.escapeHtml(appointment.student.course)}</td></tr>
                        <tr><td class="fw-bold text-muted">Year:</td><td>Year ${appointment.student.year}</td></tr>
                    </table>
                </div>
            </div>
            
            ${appointment.counselor ? `
                <div class="row mt-4">
                    <div class="col-md-6">
                        <h6 class="fw-bold text-primary mb-3">
                            <i class="fas fa-user-md me-2"></i>
                            Counselor Information
                        </h6>
                        <table class="table table-sm table-borderless">
                            <tr><td class="fw-bold text-muted">Name:</td><td>${this.escapeHtml(appointment.counselor.name)}</td></tr>
                            <tr><td class="fw-bold text-muted">Email:</td><td>${this.escapeHtml(appointment.counselor.email)}</td></tr>
                            <tr><td class="fw-bold text-muted">Specialization:</td><td>${this.escapeHtml(appointment.counselor.specialization || 'General')}</td></tr>
                            <tr><td class="fw-bold text-muted">License:</td><td>${this.escapeHtml(appointment.counselor.license || 'N/A')}</td></tr>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <h6 class="fw-bold text-primary mb-3">
                            <i class="fas fa-clipboard-list me-2"></i>
                            Session Notes
                        </h6>
                        <div class="notes-display">
                            ${appointment.counselor_notes ? this.escapeHtml(appointment.counselor_notes) : '<em class="text-muted">No session notes available</em>'}
                        </div>
                    </div>
                </div>
            ` : `
                <div class="row mt-4">
                    <div class="col-12">
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            No counselor has been assigned to this appointment yet.
                        </div>
                    </div>
                </div>
            `}
            
            <div class="row mt-4">
                <div class="col-md-6">
                    <h6 class="fw-bold text-primary mb-3">
                        <i class="fas fa-comment me-2"></i>
                        General Notes
                    </h6>
                    <div class="notes-display">
                        ${appointment.notes ? this.escapeHtml(appointment.notes) : '<em class="text-muted">No additional notes</em>'}
                    </div>
                </div>
                <div class="col-md-6">
                    <h6 class="fw-bold text-primary mb-3">
                        <i class="fas fa-user-shield me-2"></i>
                        Admin Notes
                    </h6>
                    <div class="notes-display">
                        ${appointment.admin_notes ? this.escapeHtml(appointment.admin_notes) : '<em class="text-muted">No admin notes</em>'}
                    </div>
                </div>
            </div>
            
            ${appointment.cancellation_reason ? `
                <div class="row mt-4">
                    <div class="col-12">
                        <h6 class="fw-bold text-danger mb-3">
                            <i class="fas fa-times-circle me-2"></i>
                            Cancellation Reason
                        </h6>
                        <div class="alert alert-danger">
                            ${this.escapeHtml(appointment.cancellation_reason)}
                        </div>
                    </div>
                </div>
            ` : ''}
            
            ${appointment.history && appointment.history.length > 0 ? `
                <div class="row mt-4">
                    <div class="col-12">
                        <h6 class="fw-bold text-primary mb-3">
                            <i class="fas fa-history me-2"></i>
                            Appointment History
                        </h6>
                        <div class="appointment-timeline">
                            ${appointment.history.map(item => `
                                <div class="timeline-item">
                                    <div class="d-flex justify-content-between align-items-start">
                                        <div>
                                            <div class="fw-bold">${this.formatActionName(item.action)}</div>
                                            <small class="text-muted">by ${this.escapeHtml(item.performer)}</small>
                                            ${item.notes ? `<div class="mt-1"><small>${this.escapeHtml(item.notes)}</small></div>` : ''}
                                        </div>
                                        <small class="text-muted">${this.formatDateTime(item.timestamp)}</small>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            ` : ''}
        `;
    }

    // ==========================================================================
    // FILTERING AND SEARCH
    // ==========================================================================

    applyFilters() {
        const tbody = document.getElementById('appointmentsTableBody');
        if (!tbody) return;
        
        const rows = tbody.querySelectorAll('tr');
        let visibleCount = 0;

        rows.forEach(row => {
            // Skip the "no appointments" row
            if (row.cells.length < 10) {
                return;
            }
            
            const shouldShow = this.shouldShowRow(row);
            row.style.display = shouldShow ? '' : 'none';
            
            if (shouldShow) {
                visibleCount++;
                // Ensure checkbox state is maintained
                const checkbox = row.querySelector('.appointment-checkbox');
                if (checkbox) {
                    const appointmentId = parseInt(checkbox.value);
                    checkbox.checked = this.selectedAppointments.has(appointmentId);
                }
            }
        });

        // Update visible count
        const countElement = document.getElementById('appointmentCount');
        if (countElement) {
            countElement.textContent = visibleCount;
        }

        // Update select all state
        this.updateSelectAllState();
    }

    shouldShowRow(row) {
        if (!row.cells || row.cells.length < 10) return false;

        const studentCell = row.cells[2];
        const topicCell = row.cells[3];
        const counselorCell = row.cells[6];
        const statusCell = row.cells[7];
        const dateCell = row.cells[4];

        const studentName = studentCell.textContent.toLowerCase();
        const topic = topicCell.textContent.toLowerCase();
        const counselor = counselorCell.textContent.toLowerCase();
        const status = statusCell.textContent.toLowerCase();
        const date = dateCell.textContent;

        // Apply search filter
        if (this.currentFilters.search) {
            const searchMatch = studentName.includes(this.currentFilters.search) ||
                              topic.includes(this.currentFilters.search) ||
                              counselor.includes(this.currentFilters.search);
            if (!searchMatch) return false;
        }

        // Apply status filter
        if (this.currentFilters.status && !status.includes(this.currentFilters.status.toLowerCase())) {
            return false;
        }

        // Apply counselor filter
        if (this.currentFilters.counselor) {
            const selectedCounselor = this.counselors.find(c => c.id == this.currentFilters.counselor);
            if (selectedCounselor && !counselor.includes(selectedCounselor.name.toLowerCase())) {
                return false;
            }
        }

        // Apply date filter
        if (this.currentFilters.date && !date.includes(this.currentFilters.date)) {
            return false;
        }

        return true;
    }

    clearFilters() {
        this.currentFilters = {
            search: '',
            status: '',
            counselor: '',
            date: ''
        };
        
        // Reset form inputs
        const searchInput = document.getElementById('searchInput');
        const statusFilter = document.getElementById('statusFilter');
        const counselorFilter = document.getElementById('counselorFilter');
        const dateFilter = document.getElementById('dateFilter');
        
        if (searchInput) searchInput.value = '';
        if (statusFilter) statusFilter.value = '';
        if (counselorFilter) counselorFilter.value = '';
        if (dateFilter) dateFilter.value = '';
        
        this.applyFilters();
        this.showToast('Filters cleared', 'info');
    }

    showTodayOnly() {
        const today = new Date().toISOString().split('T')[0];
        const dateFilter = document.getElementById('dateFilter');
        if (dateFilter) {
            dateFilter.value = today;
            this.currentFilters.date = today;
            this.applyFilters();
            this.showToast('Showing today\'s appointments', 'info');
        }
    }

    showWeekOnly() {
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const dateStr = startOfWeek.toISOString().split('T')[0];
        
        const dateFilter = document.getElementById('dateFilter');
        if (dateFilter) {
            dateFilter.value = dateStr;
            this.currentFilters.date = dateStr;
            this.applyFilters();
            this.showToast('Showing this week\'s appointments', 'info');
        }
    }

    // ==========================================================================
    // UTILITY FUNCTIONS
    // ==========================================================================

    calculatePriority(appointment) {
        if (appointment.status !== 'pending') {
            return appointment.priority || 'Normal';
        }
        
        const now = new Date();
        const createdDate = new Date(appointment.created_at);
        const daysDiff = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));

        if (daysDiff >= 3) return 'High';
        if (daysDiff >= 1) return 'Medium';
        return 'Normal';
    }

    getStatusColor(status) {
        const colors = {
            'pending': 'warning',
            'approved': 'info',
            'assigned': 'primary',
            'scheduled': 'primary',
            'completed': 'success',
            'cancelled': 'danger'
        };
        return colors[status] || 'secondary';
    }

    getStatusIcon(status) {
        const icons = {
            'pending': 'fa-clock',
            'approved': 'fa-check',
            'assigned': 'fa-user-check',
            'scheduled': 'fa-calendar-check',
            'completed': 'fa-check-circle',
            'cancelled': 'fa-times-circle'
        };
        return icons[status] || 'fa-question-circle';
    }

    getPriorityIcon(priority) {
        const icons = {
            'High': 'fa-exclamation-triangle',
            'Medium': 'fa-exclamation-circle',
            'Normal': 'fa-info-circle'
        };
        return icons[priority] || 'fa-info-circle';
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    formatTime(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-GB', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
        });
    }

    formatDateTime(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }

    formatActionName(action) {
        const actionNames = {
            'requested': 'Appointment Requested',
            'created_by_admin': 'Created by Admin',
            'approved': 'Approved',
            'counselor_assigned': 'Counselor Assigned',
            'rescheduled': 'Rescheduled',
            'completed': 'Completed',
            'cancelled': 'Cancelled',
            'notes_added': 'Notes Added'
        };
        return actionNames[action] || action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ==========================================================================
    // UI COMPONENTS AND HELPERS
    // ==========================================================================

    updateStatistics() {
        const stats = {
            total: this.appointments.length,
            pending: this.appointments.filter(a => a.status === 'pending').length,
            completed: this.appointments.filter(a => a.status === 'completed').length,
            cancelled: this.appointments.filter(a => a.status === 'cancelled').length
        };

        // Update stat cards
        const totalElement = document.getElementById('totalAppointments');
        const pendingElement = document.getElementById('pendingRequests');
        const completedElement = document.getElementById('completedAppointments');
        const cancelledElement = document.getElementById('cancelledAppointments');

        if (totalElement) totalElement.textContent = stats.total;
        if (pendingElement) pendingElement.textContent = stats.pending;
        if (completedElement) completedElement.textContent = stats.completed;
        if (cancelledElement) cancelledElement.textContent = stats.cancelled;

        // Show/hide pending alert
        const pendingAlert = document.getElementById('pendingAlert');
        const pendingCount = document.getElementById('pendingCount');
        
        if (pendingAlert && pendingCount) {
            if (stats.pending > 0) {
                pendingAlert.classList.remove('d-none');
                pendingCount.textContent = stats.pending;
            } else {
                pendingAlert.classList.add('d-none');
            }
        }
    }

    updateSelectAllState() {
        const visibleCheckboxes = Array.from(document.querySelectorAll('.appointment-checkbox'))
            .filter(cb => cb.closest('tr').style.display !== 'none');
        
        const selectAllCheckbox = document.getElementById('selectAll');
        const selectAllHeaderCheckbox = document.getElementById('selectAllHeader');
        
        if (visibleCheckboxes.length === 0) {
            if (selectAllCheckbox) {
                selectAllCheckbox.checked = false;
                selectAllCheckbox.indeterminate = false;
            }
            if (selectAllHeaderCheckbox) {
                selectAllHeaderCheckbox.checked = false;
                selectAllHeaderCheckbox.indeterminate = false;
            }
            return;
        }
        
        const checkedCount = visibleCheckboxes.filter(cb => cb.checked).length;
        const allChecked = checkedCount === visibleCheckboxes.length;
        const someChecked = checkedCount > 0 && checkedCount < visibleCheckboxes.length;
        
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = allChecked;
            selectAllCheckbox.indeterminate = someChecked;
        }
        
        if (selectAllHeaderCheckbox) {
            selectAllHeaderCheckbox.checked = allChecked;
            selectAllHeaderCheckbox.indeterminate = someChecked;
        }
    }

    updateBulkActionBar() {
        const bulkBar = document.getElementById('bulkActionBar');
        const selectedCountElement = document.getElementById('selectedCount');
        const selectedCount = this.selectedAppointments.size;
        
        if (bulkBar && selectedCountElement) {
            if (selectedCount > 0) {
                bulkBar.classList.remove('d-none');
                selectedCountElement.textContent = `${selectedCount} selected`;
            } else {
                bulkBar.classList.add('d-none');
            }
        }
    }

    clearSelection() {
        this.selectedAppointments.clear();
        
        // Uncheck all checkboxes
        document.querySelectorAll('.appointment-checkbox').forEach(cb => {
            cb.checked = false;
        });
        
        // Update UI
        this.updateBulkActionBar();
        this.updateSelectAllState();
    }

    populateDropdowns() {
        this.populateStudentDropdown();
        this.populateCounselorDropdowns();
    }

    populateStudentDropdown() {
        const select = document.getElementById('studentSelect');
        if (!select) return;
        
        select.innerHTML = '<option value="">Select Student</option>';
        
        this.students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = `${student.name} (${student.student_id})`;
            select.appendChild(option);
        });
    }

    populateCounselorDropdowns() {
        const selects = [
            document.getElementById('counselorSelect'),
            document.getElementById('assignCounselorSelect'),
            document.getElementById('counselorFilter')
        ];

        selects.forEach(select => {
            if (!select) return;
            
            const isFilter = select.id === 'counselorFilter';
            const placeholder = isFilter ? 'All Counselors' : 'Select Counselor';
            
            select.innerHTML = `<option value="">${placeholder}</option>`;
            
            this.counselors.forEach(counselor => {
                const option = document.createElement('option');
                option.value = counselor.id;
                const displayText = counselor.specialization 
                    ? `${counselor.name} - ${counselor.specialization}`
                    : counselor.name;
                option.textContent = displayText;
                select.appendChild(option);
            });
        });
    }

    initializeUIComponents() {
        // Initialize tooltips
        this.initializeTooltips();
        
        // Set up modal defaults
        this.setupModalDefaults();
        
        // Initialize date/time inputs
        this.initializeDateTimeInputs();
    }

    initializeTooltips() {
        // Initialize Bootstrap tooltips if available
        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        }
    }

    setupModalDefaults() {
        // Set default values for modals when they open
        const scheduleModal = document.getElementById('scheduleAppointmentModal');
        if (scheduleModal) {
            scheduleModal.addEventListener('shown.bs.modal', this.setupScheduleModal.bind(this));
        }
    }

    initializeDateTimeInputs() {
        // Set minimum dates for date inputs
        const today = new Date().toISOString().split('T')[0];
        const dateInputs = document.querySelectorAll('input[type="date"]');
        
        dateInputs.forEach(input => {
            if (!input.min) {
                input.min = today;
            }
        });
    }

    setupScheduleModal() {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                           now.getMinutes().toString().padStart(2, '0');
        
        const dateInput = document.getElementById('appointmentDate');
        const timeInput = document.getElementById('appointmentTime');
        
        if (dateInput) {
            dateInput.min = today;
            if (!dateInput.value) {
                dateInput.value = today;
            }
        }
        
        if (timeInput && !timeInput.value) {
            timeInput.value = currentTime;
        }
    }

    // ==========================================================================
    // MODAL AND FORM UTILITIES
    // ==========================================================================

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal && typeof bootstrap !== 'undefined') {
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal && typeof bootstrap !== 'undefined') {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            }
        }
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            if (typeof bootstrap !== 'undefined') {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) {
                    bsModal.hide();
                }
            }
        });
    }

    resetForm(event) {
        const form = event.target.querySelector('form');
        if (form) {
            form.reset();
            form.classList.remove('was-validated');
            
            // Clear any custom validation messages
            const invalidFeedbacks = form.querySelectorAll('.invalid-feedback');
            invalidFeedbacks.forEach(feedback => {
                feedback.style.display = 'none';
            });
        }
    }

    validateScheduleForm(data) {
        const errors = [];
        
        if (!data.student_id) errors.push('Please select a student');
        if (!data.counselor_id) errors.push('Please select a counselor');
        if (!data.appointment_date) errors.push('Please select a date');
        if (!data.appointment_time) errors.push('Please select a time');
        
        // Validate future date
        if (data.appointment_date && data.appointment_time) {
            const appointmentDateTime = new Date(`${data.appointment_date} ${data.appointment_time}`);
            if (appointmentDateTime <= new Date()) {
                errors.push('Appointment time must be in the future');
            }
        }
        
        if (errors.length > 0) {
            this.showToast(errors.join(', '), 'error');
            return false;
        }
        
        return true;
    }

    // ==========================================================================
    // USER INTERACTION UTILITIES
    // ==========================================================================

    async confirmAction(message) {
        return new Promise((resolve) => {
            if (confirm(message)) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }

    async promptForReason(title, message) {
        return new Promise((resolve) => {
            const reason = prompt(message);
            resolve(reason);
        });
    }

    // ==========================================================================
    // LOADING AND NOTIFICATION UTILITIES
    // ==========================================================================

    showLoading() {
        const loadingElement = document.getElementById('loadingSpinner');
        if (loadingElement) {
            loadingElement.style.display = 'block';
        }
        
        // Disable main controls
        const controls = document.querySelectorAll('button, select, input');
        controls.forEach(control => {
            control.disabled = true;
        });
    }

    hideLoading() {
        const loadingElement = document.getElementById('loadingSpinner');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        // Re-enable main controls
        const controls = document.querySelectorAll('button, select, input');
        controls.forEach(control => {
            control.disabled = false;
        });
    }

    showButtonLoading(button) {
        if (!button) return;
        
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Processing...';
    }

    hideButtonLoading(button, originalText) {
        if (!button) return;
        
        button.disabled = false;
        button.innerHTML = originalText;
    }

    showToast(message, type = 'info') {
        // Create toast container if it doesn't exist
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            toastContainer.style.zIndex = '1060';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.setAttribute('role', 'alert');
        
        const toastIcon = this.getToastIcon(type);
        const toastColor = this.getToastColor(type);
        
        toast.innerHTML = `
            <div class="toast-header">
                <i class="fas ${toastIcon} ${toastColor} me-2"></i>
                <strong class="me-auto">Notification</strong>
                <small class="text-muted">${new Date().toLocaleTimeString()}</small>
                <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${this.escapeHtml(message)}
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        // Show toast
        if (typeof bootstrap !== 'undefined') {
            const bsToast = new bootstrap.Toast(toast, { delay: 5000 });
            bsToast.show();
            
            // Remove from DOM after hide
            toast.addEventListener('hidden.bs.toast', () => {
                toast.remove();
            });
        } else {
            // Fallback for when Bootstrap is not available
            toast.style.display = 'block';
            setTimeout(() => {
                toast.remove();
            }, 5000);
        }
    }

    getToastIcon(type) {
        const icons = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    getToastColor(type) {
        const colors = {
            'success': 'text-success',
            'error': 'text-danger',
            'warning': 'text-warning',
            'info': 'text-primary'
        };
        return colors[type] || colors.info;
    }

    // ==========================================================================
    // AUTO-REFRESH AND DATA SYNC
    // ==========================================================================

    setupAutoRefresh() {
        // Check for updates every 30 seconds
        this.autoRefreshInterval = setInterval(async () => {
            await this.checkForUpdates();
        }, 30000);
        
        // Stop auto-refresh when page is hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoRefresh();
            } else {
                this.setupAutoRefresh();
            }
        });
        
        console.log('Auto-refresh setup complete');
    }

    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }

    async checkForUpdates() {
        try {
            const params = new URLSearchParams();
            if (this.lastUpdateCheck) {
                params.append('last_check', this.lastUpdateCheck);
            }
            
            const response = await fetch(`/api/admin/appointments/check-updates?${params}`);
            const data = await response.json();
            
            if (data.success && data.hasUpdates) {
                this.showUpdateNotification();
            }
            
            this.lastUpdateCheck = data.timestamp || new Date().toISOString();
            
        } catch (error) {
            console.error('Auto-refresh check failed:', error);
        }
    }

    showUpdateNotification() {
        // Create update notification
        const notification = document.createElement('div');
        notification.className = 'alert alert-info alert-dismissible fade show position-fixed';
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 1070; max-width: 400px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-sync-alt fa-spin me-2"></i>
                <div class="flex-grow-1">
                    <strong>New Updates Available</strong><br>
                    <small>New appointments or changes detected.</small>
                </div>
                <button type="button" class="btn btn-sm btn-outline-primary me-2" onclick="appointmentManager.refreshAppointments(); this.closest('.alert').remove();">
                    Refresh
                </button>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 15 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 15000);
    }

    async refreshAppointments() {
        try {
            this.showToast('Refreshing appointments...', 'info');
            await this.loadAppointments();
            this.showToast('Appointments refreshed successfully!', 'success');
        } catch (error) {
            console.error('Failed to refresh appointments:', error);
            this.showToast('Failed to refresh appointments', 'error');
        }
    }

    // ==========================================================================
    // EXPORT FUNCTIONALITY
    // ==========================================================================

    exportAppointments() {
        try {
            if (this.appointments.length === 0) {
                this.showToast('No appointments to export', 'warning');
                return;
            }
            
            // Prepare CSV headers
            const headers = [
                'ID',
                'Student Name',
                'Student ID',
                'Email',
                'Course',
                'Topic',
                'Requested Date',
                'Scheduled Date',
                'Duration (mins)',
                'Counselor',
                'Counselor Specialization',
                'Status',
                'Priority',
                'Notes',
                'Created Date',
                'Updated Date'
            ];
            
            let csv = headers.join(',') + '\n';
            
            // Add appointment data
            this.appointments.forEach(appointment => {
                const row = [
                    appointment.id,
                    `"${appointment.student.name}"`,
                    appointment.student.student_id,
                    appointment.student.email,
                    `"${appointment.student.course}"`,
                    `"${appointment.topic || 'General Counseling'}"`,
                    this.formatDateTime(appointment.requested_date),
                    appointment.scheduled_date ? this.formatDateTime(appointment.scheduled_date) : 'Not scheduled',
                    appointment.duration,
                    appointment.counselor ? `"${appointment.counselor.name}"` : 'Not assigned',
                    appointment.counselor ? `"${appointment.counselor.specialization || 'General'}"` : 'N/A',
                    appointment.status,
                    this.calculatePriority(appointment),
                    `"${(appointment.notes || '').replace(/"/g, '""')}"`,
                    this.formatDateTime(appointment.created_at),
                    this.formatDateTime(appointment.updated_at)
                ];
                csv += row.join(',') + '\n';
            });
            
            // Create and download CSV file
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            const filename = `cuea_appointments_export_${new Date().toISOString().split('T')[0]}.csv`;
            
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            window.URL.revokeObjectURL(url);
            
            this.showToast(`Exported ${this.appointments.length} appointments to ${filename}`, 'success');
            
        } catch (error) {
            console.error('Error exporting appointments:', error);
            this.showToast('Failed to export appointments data', 'error');
        }
    }

    // ==========================================================================
    // UTILITY FUNCTIONS
    // ==========================================================================

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    getCSRFToken() {
        // Try to get CSRF token from meta tag or cookie
        const metaToken = document.querySelector('meta[name="csrf-token"]');
        if (metaToken) {
            return metaToken.getAttribute('content');
        }
        
        // Fallback: try to get from cookie
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'csrf_token') {
                return decodeURIComponent(value);
            }
        }
        
        return '';
    }

    // ==========================================================================
    // ERROR HANDLING
    // ==========================================================================

    handleError(error, context = 'Unknown') {
        console.error(`Error in ${context}:`, error);
        
        let message = 'An unexpected error occurred';
        
        if (error.message) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        }
        
        this.showToast(message, 'error');
    }

    // ==========================================================================
    // CLEANUP
    // ==========================================================================

    destroy() {
        // Clean up intervals
        this.stopAutoRefresh();
        
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyboardShortcuts);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        
        // Clear data
        this.appointments = [];
        this.counselors = [];
        this.students = [];
        this.selectedAppointments.clear();
        
        console.log('Appointment Manager destroyed');
    }
}

// =============================================================================
// GLOBAL FUNCTIONS AND INITIALIZATION
// =============================================================================

// Global appointment manager instance
let appointmentManager;

// Global functions that can be called from HTML onclick handlers
function exportAppointments() {
    if (appointmentManager) {
        appointmentManager.exportAppointments();
    }
}

function refreshAppointments() {
    if (appointmentManager) {
        appointmentManager.refreshAppointments();
    }
}

function clearFilters() {
    if (appointmentManager) {
        appointmentManager.clearFilters();
    }
}

function showTodayOnly() {
    if (appointmentManager) {
        appointmentManager.showTodayOnly();
    }
}

function showWeekOnly() {
    if (appointmentManager) {
        appointmentManager.showWeekOnly();
    }
}

function clearSelection() {
    if (appointmentManager) {
        appointmentManager.clearSelection();
    }
}

function bulkApprove() {
    if (appointmentManager) {
        appointmentManager.bulkApprove();
    }
}

function bulkReschedule() {
    if (appointmentManager) {
        appointmentManager.bulkReschedule();
    }
}

function bulkCancel() {
    if (appointmentManager) {
        appointmentManager.bulkCancel();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing Appointment Manager...');
    
    try {
        appointmentManager = new AppointmentManager();
    } catch (error) {
        console.error('Failed to initialize Appointment Manager:', error);
        
        // Show error message to user
        const errorAlert = document.createElement('div');
        errorAlert.className = 'alert alert-danger alert-dismissible fade show';
        errorAlert.innerHTML = `
            <h4 class="alert-heading">Initialization Error</h4>
            <p>Failed to initialize the appointment management system. Please refresh the page or contact support.</p>
            <hr>
            <p class="mb-0"><strong>Error:</strong> ${error.message || 'Unknown error'}</p>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.insertBefore(errorAlert, mainContent.firstChild);
        }
    }
});

// Handle page unload cleanup
window.addEventListener('beforeunload', function() {
    if (appointmentManager) {
        appointmentManager.destroy();
    }
});

// Handle page visibility changes for auto-refresh
document.addEventListener('visibilitychange', function() {
    if (appointmentManager) {
        if (document.hidden) {
            appointmentManager.stopAutoRefresh();
        } else {
            appointmentManager.setupAutoRefresh();
        }
    }
});

// Global error handler for unhandled promises
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    
    if (appointmentManager) {
        appointmentManager.showToast('An unexpected error occurred. Please try again.', 'error');
    }
    
    // Prevent the default browser behavior
    event.preventDefault();
});

// Ensure Bootstrap tooltips are reinitialized after dynamic content updates
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // Reinitialize tooltips for new elements
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                    const tooltips = node.querySelectorAll('[data-bs-toggle="tooltip"]');
                    tooltips.forEach(function(tooltip) {
                        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
                            new bootstrap.Tooltip(tooltip);
                        }
                    });
                }
            });
        }
    });
});

// Start observing
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Console welcome message
console.log(`
%c🎯 CUEA MindConnect - Appointment Management System
%cVersion: 1.0.0
%cLoaded successfully! 🚀
`, 
'color: #667eea; font-size: 16px; font-weight: bold;',
'color: #764ba2; font-size: 12px;',
'color: #28a745; font-size: 12px; font-weight: bold;'
);



//=================================================================================
// END OF ADMIN APPOINTMENT MANAGEMENT JAVASCRIPT
//=================================================================================


// =============================================================================
// ADMIN CONTENT MANAGEMENT JAVASCRIPT
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Content Management loaded');
    
    // Initialize page
    initializeContentManagement();
    setupEventListeners();
    setupFormValidation();
});

// =============================================================================
// INITIALIZATION
// =============================================================================

function initializeContentManagement() {
    // Toggle URL field based on initial resource type
    toggleUrlField();
    
    // Setup file upload validation
    setupFileUploadValidation();
    
    // Initialize rich text editor if available
    initializeEditor();
    
    // Setup auto-refresh for content stats
    refreshContentStats();
}

function setupEventListeners() {
    // Resource type change
    const resourceTypeSelect = document.getElementById('resource_type');
    if (resourceTypeSelect) {
        resourceTypeSelect.addEventListener('change', toggleUrlField);
    }
    
    // Edit resource type change
    const editResourceTypeSelect = document.getElementById('editResourceType');
    if (editResourceTypeSelect) {
        editResourceTypeSelect.addEventListener('change', toggleEditUrlField);
    }
    
    // Filter events
    document.getElementById('categoryFilter')?.addEventListener('change', filterContent);
    document.getElementById('typeFilter')?.addEventListener('change', filterContent);
    document.getElementById('searchContent')?.addEventListener('input', debounce(filterContent, 300));
    
    // Form submissions
    document.getElementById('addContentForm')?.addEventListener('submit', handleAddContent);
    document.getElementById('editContentForm')?.addEventListener('submit', handleEditContent);
    
    // Modal events
    setupModalEvents();
}

function setupModalEvents() {
    // Reset forms when modals close
    const addModal = document.getElementById('addContentModal');
    const editModal = document.getElementById('editContentModal');
    
    if (addModal) {
        addModal.addEventListener('hidden.bs.modal', function() {
            resetAddForm();
        });
    }
    
    if (editModal) {
        editModal.addEventListener('hidden.bs.modal', function() {
            resetEditForm();
        });
    }
}

// =============================================================================
// FORM HANDLING
// =============================================================================

function handleAddContent(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Validate form
    if (!validateContentForm(formData)) {
        return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    submitBtn.disabled = true;
    
    // Submit form
    fetch('/admin/content/add', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            showNotification('Content added successfully!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('addContentModal')).hide();
            setTimeout(() => location.reload(), 1000);
        } else {
            throw new Error('Failed to add content');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Failed to add content. Please try again.', 'error');
    })
    .finally(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

function handleEditContent(e) {
    e.preventDefault();
    
    const form = e.target;
    const contentId = document.getElementById('editContentId').value;
    const formData = new FormData();
    
    // Collect form data
    formData.append('title', document.getElementById('editTitle').value);
    formData.append('category', document.getElementById('editCategory').value);
    formData.append('resource_type', document.getElementById('editResourceType').value);
    formData.append('tags', document.getElementById('editTags').value);
    formData.append('url', document.getElementById('editUrl').value);
    formData.append('content', document.getElementById('editContent').value);
    formData.append('is_featured', document.getElementById('editIsFeatured').checked);
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
    submitBtn.disabled = true;
    
    fetch(`/api/admin/content/${contentId}/edit`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Content updated successfully!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('editContentModal')).hide();
            setTimeout(() => location.reload(), 1000);
        } else {
            throw new Error(data.message || 'Failed to update content');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Failed to update content: ' + error.message, 'error');
    })
    .finally(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

// =============================================================================
// CONTENT ACTIONS
// =============================================================================

function viewContent(contentId) {
    showLoading('Loading content...');
    
    fetch(`/api/admin/content/${contentId}`)
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.success) {
                displayContentDetails(data.content);
            } else {
                throw new Error('Content not found');
            }
        })
        .catch(error => {
            hideLoading();
            console.error('Error:', error);
            showNotification('Failed to load content details', 'error');
        });
}

function editContent(contentId) {
    showLoading('Loading content for editing...');
    
    fetch(`/api/admin/content/${contentId}`)
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.success) {
                populateEditForm(data.content);
                new bootstrap.Modal(document.getElementById('editContentModal')).show();
            } else {
                throw new Error('Content not found');
            }
        })
        .catch(error => {
            hideLoading();
            console.error('Error:', error);
            showNotification('Failed to load content for editing', 'error');
        });
}

function toggleFeatured(contentId) {
    const button = event.target.closest('button');
    const originalHtml = button.innerHTML;
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    button.disabled = true;
    
    fetch(`/api/admin/content/${contentId}/toggle-featured`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(data.message, 'success');
            
            // Update button appearance
            const icon = button.querySelector('i');
            if (data.is_featured) {
                button.className = 'btn btn-sm btn-outline-warning btn-action';
                icon.className = 'fas fa-star';
            } else {
                button.className = 'btn btn-sm btn-outline-success btn-action';
                icon.className = 'fas fa-star';
            }
            
            // Update the star in the table
            const row = button.closest('tr');
            const starCell = row.querySelector('td:nth-child(4)');
            if (data.is_featured) {
                starCell.innerHTML = '<i class="fas fa-star text-warning"></i>';
            } else {
                starCell.innerHTML = '<i class="far fa-star text-muted"></i>';
            }
        } else {
            throw new Error('Failed to update featured status');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Failed to update featured status', 'error');
    })
    .finally(() => {
        button.innerHTML = originalHtml;
        button.disabled = false;
    });
}

function deleteContent(contentId) {
    // Get content title for confirmation
    const row = event.target.closest('tr');
    const title = row.querySelector('.fw-bold').textContent;
    
    if (confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
        const button = event.target.closest('button');
        const originalHtml = button.innerHTML;
        
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        button.disabled = true;
        
        fetch(`/api/admin/content/${contentId}/delete`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification(data.message, 'success');
                
                // Remove row with animation
                row.style.transition = 'opacity 0.3s ease';
                row.style.opacity = '0';
                setTimeout(() => {
                    row.remove();
                    updateContentStats();
                }, 300);
            } else {
                throw new Error(data.message || 'Failed to delete content');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Failed to delete content: ' + error.message, 'error');
            
            button.innerHTML = originalHtml;
            button.disabled = false;
        });
    }
}

// =============================================================================
// UI HELPERS
// =============================================================================

function toggleUrlField() {
    const resourceType = document.getElementById('resource_type')?.value;
    const urlField = document.getElementById('urlField');
    const urlInput = document.getElementById('url');
    
    if (resourceType === 'external_link') {
        urlField.style.display = 'block';
        urlInput.required = true;
    } else {
        urlField.style.display = 'none';
        urlInput.required = false;
    }
}

function toggleEditUrlField() {
    const resourceType = document.getElementById('editResourceType')?.value;
    const urlField = document.getElementById('editUrlField');
    
    if (resourceType === 'external_link') {
        urlField.style.display = 'block';
    } else {
        urlField.style.display = 'none';
    }
}

function displayContentDetails(content) {
    document.getElementById('viewContentTitle').textContent = content.title;
    
    let bodyHtml = `
        <div class="row">
            <div class="col-md-6"><strong>Category:</strong> ${content.category}</div>
            <div class="col-md-6"><strong>Type:</strong> ${content.resource_type.replace('_', ' ')}</div>
        </div>
        <div class="row mt-2">
            <div class="col-md-6"><strong>Featured:</strong> ${content.is_featured ? 'Yes' : 'No'}</div>
            <div class="col-md-6"><strong>Created:</strong> ${content.created_at}</div>
        </div>
        ${content.tags ? `<div class="mt-2"><strong>Tags:</strong> ${content.tags}</div>` : ''}
        ${content.url ? `<div class="mt-2"><strong>URL:</strong> <a href="${content.url}" target="_blank">${content.url}</a></div>` : ''}
        <hr>
        <div class="mt-3">
            <h6>Content:</h6>
            <div style="max-height: 300px; overflow-y: auto; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
                ${content.content}
            </div>
        </div>
    `;
    
    document.getElementById('viewContentBody').innerHTML = bodyHtml;
    new bootstrap.Modal(document.getElementById('viewContentModal')).show();
}

function populateEditForm(content) {
    document.getElementById('editContentId').value = content.id;
    document.getElementById('editTitle').value = content.title;
    document.getElementById('editCategory').value = content.category;
    document.getElementById('editResourceType').value = content.resource_type;
    document.getElementById('editTags').value = content.tags || '';
    document.getElementById('editUrl').value = content.url || '';
    document.getElementById('editContent').value = content.content;
    document.getElementById('editIsFeatured').checked = content.is_featured;
    
    // Toggle URL field visibility
    toggleEditUrlField();
}

function resetAddForm() {
    const form = document.getElementById('addContentForm');
    if (form) {
        form.reset();
        toggleUrlField();
    }
}

function resetEditForm() {
    const form = document.getElementById('editContentForm');
    if (form) {
        form.reset();
    }
}

// =============================================================================
// FILTERING AND SEARCH
// =============================================================================

function filterContent() {
    const category = document.getElementById('categoryFilter')?.value.toLowerCase() || '';
    const type = document.getElementById('typeFilter')?.value.toLowerCase() || '';
    const search = document.getElementById('searchContent')?.value.toLowerCase() || '';
    
    const rows = document.querySelectorAll('#contentTableBody tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        const categoryCell = row.cells[1].textContent.toLowerCase();
        const typeCell = row.cells[2].textContent.toLowerCase();
        const titleCell = row.cells[0].textContent.toLowerCase();
        
        const categoryMatch = !category || categoryCell.includes(category);
        const typeMatch = !type || typeCell.includes(type.replace('_', ' '));
        const searchMatch = !search || titleCell.includes(search);
        
        if (categoryMatch && typeMatch && searchMatch) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Update filter results indicator
    updateFilterResults(visibleCount, rows.length);
}

function updateFilterResults(visible, total) {
    // Create or update filter results indicator
    let indicator = document.getElementById('filterResults');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'filterResults';
        indicator.className = 'text-muted small mt-2';
        document.querySelector('.table-responsive').appendChild(indicator);
    }
    
    if (visible === total) {
        indicator.textContent = `Showing all ${total} items`;
    } else {
        indicator.textContent = `Showing ${visible} of ${total} items`;
    }
}

// =============================================================================
// VALIDATION
// =============================================================================

function setupFormValidation() {
    // Add real-time validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearFieldError);
        });
    });
}

function validateContentForm(formData) {
    const title = formData.get('title');
    const category = formData.get('category');
    const resourceType = formData.get('resource_type');
    const content = formData.get('content');
    const url = formData.get('url');
    
    // Clear previous errors
    clearFormErrors();
    
    let isValid = true;
    
    if (!title || title.trim().length < 3) {
        showFieldError('title', 'Title must be at least 3 characters long');
        isValid = false;
    }
    
    if (!category) {
        showFieldError('category', 'Please select a category');
        isValid = false;
    }
    
    if (!resourceType) {
        showFieldError('resource_type', 'Please select a resource type');
        isValid = false;
    }
    
    if (!content || content.trim().length < 10) {
        showFieldError('content', 'Content must be at least 10 characters long');
        isValid = false;
    }
    
    if (resourceType === 'external_link' && (!url || !isValidUrl(url))) {
        showFieldError('url', 'Please enter a valid URL');
        isValid = false;
    }
    
    return isValid;
}

function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    clearFieldError(field.id);
    
    if (field.required && !value) {
        showFieldError(field.id, 'This field is required');
        return false;
    }
    
    // Specific validations
    switch (field.id) {
        case 'title':
        case 'editTitle':
            if (value.length < 3) {
                showFieldError(field.id, 'Title must be at least 3 characters long');
                return false;
            }
            break;
        case 'url':
        case 'editUrl':
            if (value && !isValidUrl(value)) {
                showFieldError(field.id, 'Please enter a valid URL');
                return false;
            }
            break;
        case 'content':
        case 'editContent':
            if (value.length < 10) {
                showFieldError(field.id, 'Content must be at least 10 characters long');
                return false;
            }
            break;
    }
    
    return true;
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    field.classList.add('is-invalid');
    
    let errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        field.parentNode.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
}

function clearFieldError(fieldIdOrEvent) {
    const fieldId = typeof fieldIdOrEvent === 'string' ? fieldIdOrEvent : fieldIdOrEvent.target.id;
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    field.classList.remove('is-invalid');
    const errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
        errorDiv.remove();
    }
}

function clearFormErrors() {
    const errorFields = document.querySelectorAll('.is-invalid');
    errorFields.forEach(field => {
        field.classList.remove('is-invalid');
    });
    
    const errorMessages = document.querySelectorAll('.invalid-feedback');
    errorMessages.forEach(msg => msg.remove());
}

// =============================================================================
// FILE UPLOAD
// =============================================================================

function setupFileUploadValidation() {
    const fileInput = document.getElementById('file');
    if (!fileInput) return;
    
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Clear previous errors
        clearFieldError('file');
        
        // Check file size (10MB limit)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            showFieldError('file', 'File size must be less than 10MB');
            fileInput.value = '';
            return;
        }
        
        // Check file type
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif'
        ];
        
        if (!allowedTypes.includes(file.type)) {
            showFieldError('file', 'Invalid file type. Please upload PDF, DOC, DOCX, JPG, PNG, or GIF files only.');
            fileInput.value = '';
            return;
        }
        
        // Show file info
        showFileInfo(file);
    });
}

function showFileInfo(file) {
    const fileInput = document.getElementById('file');
    let infoDiv = fileInput.parentNode.querySelector('.file-info');
    
    if (!infoDiv) {
        infoDiv = document.createElement('div');
        infoDiv.className = 'file-info text-success small mt-1';
        fileInput.parentNode.appendChild(infoDiv);
    }
    
    const fileSize = (file.size / 1024 / 1024).toFixed(2);
    infoDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${file.name} (${fileSize} MB)`;
}

// =============================================================================
// UTILITIES
// =============================================================================

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 150);
        }
    }, 5000);
}

function showLoading(message = 'Loading...') {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loadingOverlay';
    loadingDiv.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center';
    loadingDiv.style.cssText = 'background: rgba(0,0,0,0.5); z-index: 9999;';
    loadingDiv.innerHTML = `
        <div class="bg-white p-4 rounded shadow">
            <div class="d-flex align-items-center">
                <div class="spinner-border spinner-border-sm me-3" role="status"></div>
                <span>${message}</span>
            </div>
        </div>
    `;
    
    document.body.appendChild(loadingDiv);
}

function hideLoading() {
    const loadingDiv = document.getElementById('loadingOverlay');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

function updateContentStats() {
    // Update the statistics cards with current counts
    const visibleRows = document.querySelectorAll('#contentTableBody tr:not([style*="display: none"])');
    const totalCount = visibleRows.length;
    
    // You can add more sophisticated stat updates here
    console.log(`Content stats updated: ${totalCount} items visible`);
}

function refreshContentStats() {
    // Auto-refresh stats every 30 seconds
    setInterval(updateContentStats, 30000);
}

function initializeEditor() {
    // Initialize rich text editor if TinyMCE or similar is available
    if (typeof tinymce !== 'undefined') {
        tinymce.init({
            selector: '#contentEditor, #editContent',
            height: 200,
            menubar: false,
            plugins: [
                'advlist autolink lists link image charmap print preview anchor',
                'searchreplace visualblocks code fullscreen',
                'insertdatetime media table paste code help wordcount'
            ],
            toolbar: 'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help'
        });
    }
}

// =============================================================================
// QUICK ACTIONS
// =============================================================================

function quickActionAddContent() {
    new bootstrap.Modal(document.getElementById('addContentModal')).show();
}

function quickActionViewStats() {
    // Navigate to analytics or show stats modal
    window.location.href = '/admin/analytics';
}

function exportContentData() {
    // Export content data as CSV or JSON
    const rows = document.querySelectorAll('#contentTableBody tr:not([style*="display: none"])');
    const data = [];
    
    rows.forEach(row => {
        const cells = row.cells;
        data.push({
            title: cells[0].querySelector('.fw-bold').textContent,
            category: cells[1].textContent.trim(),
            type: cells[2].textContent.trim(),
            featured: cells[3].querySelector('i').classList.contains('fas'),
            created: cells[4].textContent.trim()
        });
    });
    
    const csv = convertToCSV(data);
    downloadCSV(csv, 'content-export.csv');
}

function convertToCSV(data) {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    
    return csvContent;
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// =============================================================================
// KEYBOARD SHORTCUTS
// =============================================================================

document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K for quick search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('searchContent')?.focus();
    }
    
    // Ctrl/Cmd + N for new content
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        quickActionAddContent();
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal.show');
        openModals.forEach(modal => {
            bootstrap.Modal.getInstance(modal)?.hide();
        });
    }
});

// Make functions globally available
window.viewContent = viewContent;
window.editContent = editContent;
window.toggleFeatured = toggleFeatured;
window.deleteContent = deleteContent;
window.quickActionAddContent = quickActionAddContent;
window.exportContentData = exportContentData;

// =============================================================================
// END OF ADMIN CONTENT MANAGEMENT JAVASCRIPT
// =============================================================================


// =============================================================================
// ADMIN FORUM OVERSIGHT JAVASCRIPT
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Forum Oversight loaded');
    
    // Initialize page
    initializeForumOversight();
    setupEventListeners();
    setupAutoRefresh();
});

// Global variables
let currentPostId = null;
let lastUpdateCheck = new Date().toISOString();
let autoRefreshInterval = null;

// =============================================================================
// INITIALIZATION
// =============================================================================

function initializeForumOversight() {
    // Setup filtering
    initializeFilters();
    
    // Setup modals
    initializeModals();
    
    // Check for updates
    checkForUpdates();
    
    // Update statistics
    updateStatistics();
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
}

function setupEventListeners() {
    // Filter events
    document.getElementById('categoryFilter')?.addEventListener('change', filterPosts);
    document.getElementById('statusFilter')?.addEventListener('change', filterPosts);
    document.getElementById('dateFilter')?.addEventListener('change', filterPosts);
    document.getElementById('searchPosts')?.addEventListener('input', debounce(filterPosts, 300));
    
    // Quick action buttons
    document.querySelector('[onclick="refreshPosts()"]')?.addEventListener('click', refreshPosts);
    document.querySelector('[onclick="showFlaggedOnly()"]')?.addEventListener('click', showFlaggedOnly);
    
    // Flag form submission
    document.getElementById('flagForm')?.addEventListener('submit', handleFlagSubmission);
    
    // Modal events
    setupModalEvents();
}

function setupModalEvents() {
    // Reset flag form when modal closes
    const flagModal = document.getElementById('flagModal');
    if (flagModal) {
        flagModal.addEventListener('hidden.bs.modal', function() {
            resetFlagForm();
        });
    }
    
    // Clear view modal when closed
    const viewModal = document.getElementById('viewPostModal');
    if (viewModal) {
        viewModal.addEventListener('hidden.bs.modal', function() {
            currentPostId = null;
        });
    }
}

// =============================================================================
// POST MANAGEMENT
// =============================================================================

function viewPost(postId) {
    currentPostId = postId;
    showLoading('Loading post details...');
    
    fetch(`/api/admin/forum/post/${postId}`)
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.success) {
                displayPostDetails(data.post, data.replies);
                updateModalButtons(data.post);
                new bootstrap.Modal(document.getElementById('viewPostModal')).show();
            } else {
                throw new Error(data.message || 'Post not found');
            }
        })
        .catch(error => {
            hideLoading();
            console.error('Error:', error);
            showNotification('Failed to load post details: ' + error.message, 'error');
        });
}

function displayPostDetails(post, replies) {
    document.getElementById('viewPostTitle').textContent = post.title;
    
    let bodyHtml = `
        <div class="row mb-3">
            <div class="col-md-6">
                <strong>Author:</strong> ${post.author_name}
                ${post.is_anonymous ? '<span class="badge bg-secondary ms-2">Anonymous</span>' : ''}
            </div>
            <div class="col-md-6">
                <strong>Category:</strong> 
                <span class="badge bg-primary">${post.category.replace('-', ' ')}</span>
            </div>
        </div>
        <div class="row mb-3">
            <div class="col-md-6">
                <strong>Posted:</strong> ${post.created_at}
            </div>
            <div class="col-md-6">
                <strong>Status:</strong> 
                <span class="badge bg-${post.is_flagged ? 'warning' : 'success'}">
                    ${post.is_flagged ? 'Flagged' : 'Active'}
                </span>
                ${post.flag_reason ? `<br><small class="text-muted">Reason: ${post.flag_reason}</small>` : ''}
            </div>
        </div>
        
        <div class="post-content">
            <h6>Post Content:</h6>
            <div class="p-3 bg-light rounded">${post.content}</div>
        </div>
        
        <hr>
        
        <h6>Replies (${replies.length}):</h6>
        <div style="max-height: 400px; overflow-y: auto;" id="repliesContainer">
    `;
    
    if (replies.length > 0) {
        replies.forEach((reply, index) => {
            bodyHtml += `
                <div class="reply-item mb-3 p-3 border rounded ${reply.is_flagged ? 'border-warning bg-warning-light' : 'bg-light'}" data-reply-id="${reply.id}">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <strong>${reply.author_name}</strong>
                            ${reply.is_anonymous ? '<span class="badge bg-secondary ms-1">Anonymous</span>' : ''}
                            ${reply.is_flagged ? '<span class="badge bg-warning ms-1">Flagged</span>' : ''}
                            <small class="text-muted ms-2">${reply.created_at}</small>
                        </div>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-outline-warning" 
                                    onclick="flagReply(${reply.id})" title="Flag Reply">
                                <i class="fas fa-flag"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" 
                                    onclick="deleteReply(${reply.id})" title="Delete Reply">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="mt-2">${reply.content}</div>
                    ${reply.flag_reason ? `<div class="mt-1"><small class="text-warning">Flag reason: ${reply.flag_reason}</small></div>` : ''}
                </div>
            `;
        });
    } else {
        bodyHtml += '<p class="text-muted">No replies yet.</p>';
    }
    
    bodyHtml += '</div>';
    
    document.getElementById('viewPostBody').innerHTML = bodyHtml;
}

function updateModalButtons(post) {
    const flagBtn = document.getElementById('flagPostBtn');
    const deleteBtn = document.getElementById('deletePostBtn');
    
    if (flagBtn) {
        if (post.is_flagged) {
            flagBtn.innerHTML = '<i class="fas fa-flag"></i> Unflag Post';
            flagBtn.className = 'btn btn-success';
        } else {
            flagBtn.innerHTML = '<i class="fas fa-flag"></i> Flag Post';
            flagBtn.className = 'btn btn-warning';
        }
    }
}

// =============================================================================
// FLAGGING SYSTEM
// =============================================================================

function toggleFlag(postId) {
    const button = event.target.closest('button');
    const row = button.closest('tr');
    const originalHtml = button.innerHTML;
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    button.disabled = true;
    
    fetch(`/api/admin/forum/post/${postId}/toggle-flag`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(data.message, 'success');
            
            // Update row appearance
            if (data.is_flagged) {
                row.classList.add('flagged-post');
                row.querySelector('td:nth-child(5)').innerHTML = '<span class="badge bg-warning">Flagged</span>';
            } else {
                row.classList.remove('flagged-post');
                row.querySelector('td:nth-child(5)').innerHTML = '<span class="badge bg-success">Active</span>';
            }
            
            updateStatistics();
        } else {
            throw new Error(data.message || 'Failed to update flag status');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Failed to update flag status: ' + error.message, 'error');
    })
    .finally(() => {
        button.innerHTML = originalHtml;
        button.disabled = false;
    });
}

function flagPostFromModal() {
    if (currentPostId) {
        toggleFlag(currentPostId);
        bootstrap.Modal.getInstance(document.getElementById('viewPostModal')).hide();
    }
}

function flagReply(replyId) {
    document.getElementById('flagPostId').value = '';
    document.getElementById('flagReplyId').value = replyId;
    new bootstrap.Modal(document.getElementById('flagModal')).show();
}

function handleFlagSubmission(e) {
    e.preventDefault();
    
    const postId = document.getElementById('flagPostId').value;
    const replyId = document.getElementById('flagReplyId').value;
    const reason = document.getElementById('flagReason').value;
    const notes = document.getElementById('flagNotes').value;
    
    if (!reason) {
        showNotification('Please select a reason for flagging', 'error');
        return;
    }
    
    const url = postId ? `/api/admin/forum/post/${postId}/flag` : `/api/admin/forum/reply/${replyId}/flag`;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Flagging...';
    submitBtn.disabled = true;
    
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            reason: reason,
            notes: notes
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(data.message, 'success');
            bootstrap.Modal.getInstance(document.getElementById('flagModal')).hide();
            
            // Refresh the current view
            if (currentPostId) {
                viewPost(currentPostId);
            } else {
                setTimeout(() => location.reload(), 1000);
            }
        } else {
            throw new Error(data.message || 'Failed to flag content');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Failed to flag content: ' + error.message, 'error');
    })
    .finally(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

// =============================================================================
// DELETE OPERATIONS
// =============================================================================

function deletePost(postId) {
    const row = event.target.closest('tr');
    const title = row.querySelector('.fw-bold').textContent;
    
    if (confirm(`Are you sure you want to delete the post "${title}"? This will also delete all replies. This action cannot be undone.`)) {
        const button = event.target.closest('button');
        const originalHtml = button.innerHTML;
        
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        button.disabled = true;
        
        fetch(`/api/admin/forum/post/${postId}/delete`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification(data.message, 'success');
                
                // Remove row with animation
                row.style.transition = 'opacity 0.3s ease';
                row.style.opacity = '0';
                setTimeout(() => {
                    row.remove();
                    updateStatistics();
                }, 300);
            } else {
                throw new Error(data.message || 'Failed to delete post');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Failed to delete post: ' + error.message, 'error');
            
            button.innerHTML = originalHtml;
            button.disabled = false;
        });
    }
}

function deletePostFromModal() {
    if (currentPostId) {
        // Find the row in the table
        const row = document.querySelector(`tr[data-post-id="${currentPostId}"]`);
        if (row) {
            const event = { target: row.querySelector('button[onclick*="deletePost"]') };
            deletePost(currentPostId);
        }
        bootstrap.Modal.getInstance(document.getElementById('viewPostModal')).hide();
    }
}

function deleteReply(replyId) {
    if (confirm('Are you sure you want to delete this reply? This action cannot be undone.')) {
        const replyElement = document.querySelector(`[data-reply-id="${replyId}"]`);
        
        fetch(`/api/admin/forum/reply/${replyId}/delete`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification(data.message, 'success');
                
                // Remove reply with animation
                if (replyElement) {
                    replyElement.style.transition = 'opacity 0.3s ease';
                    replyElement.style.opacity = '0';
                    setTimeout(() => {
                        replyElement.remove();
                        updateReplyCount();
                    }, 300);
                }
            } else {
                throw new Error(data.message || 'Failed to delete reply');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Failed to delete reply: ' + error.message, 'error');
        });
    }
}

// =============================================================================
// FILTERING AND SEARCH
// =============================================================================

function filterPosts() {
    const category = document.getElementById('categoryFilter')?.value.toLowerCase() || '';
    const status = document.getElementById('statusFilter')?.value.toLowerCase() || '';
    const dateFilter = document.getElementById('dateFilter')?.value || '';
    const search = document.getElementById('searchPosts')?.value.toLowerCase() || '';
    
    const rows = document.querySelectorAll('#forumTableBody tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        const categoryCell = row.cells[2].textContent.toLowerCase();
        const statusCell = row.cells[4].textContent.toLowerCase();
        const titleCell = row.cells[0].textContent.toLowerCase();
        const dateCell = row.cells[5].textContent;
        
        const categoryMatch = !category || categoryCell.includes(category.replace('-', ' '));
        const statusMatch = !status || statusCell.includes(status);
        const searchMatch = !search || titleCell.includes(search);
        const dateMatch = checkDateFilter(dateCell, dateFilter);
        
        if (categoryMatch && statusMatch && searchMatch && dateMatch) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    updateFilterResults(visibleCount, rows.length);
}

function checkDateFilter(dateText, filter) {
    if (!filter) return true;
    
    const postDate = new Date(dateText);
    const now = new Date();
    
    switch (filter) {
        case 'today':
            return postDate.toDateString() === now.toDateString();
        case 'week':
            const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
            return postDate >= weekAgo;
        case 'month':
            const monthAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
            return postDate >= monthAgo;
        default:
            return true;
    }
}

function updateFilterResults(visible, total) {
    let indicator = document.getElementById('filterResults');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'filterResults';
        indicator.className = 'text-muted small mt-2';
        const tableContainer = document.querySelector('.forum-card');
        if (tableContainer) {
            tableContainer.appendChild(indicator);
        }
    }
    
    if (visible === total) {
        indicator.textContent = `Showing all ${total} posts`;
    } else {
        indicator.textContent = `Showing ${visible} of ${total} posts`;
    }
}

function showFlaggedOnly() {
    // Reset other filters
    document.getElementById('categoryFilter').value = '';
    document.getElementById('statusFilter').value = 'flagged';
    document.getElementById('dateFilter').value = '';
    document.getElementById('searchPosts').value = '';
    
    filterPosts();
    showNotification('Showing only flagged posts', 'info');
}

// =============================================================================
// AUTO-REFRESH AND UPDATES
// =============================================================================

function setupAutoRefresh() {
    // Check for updates every 30 seconds
    autoRefreshInterval = setInterval(checkForUpdates, 30000);
}

function checkForUpdates() {
    fetch(`/api/admin/forum/check-updates?last_check=${encodeURIComponent(lastUpdateCheck)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.hasUpdates) {
                showUpdateNotification();
            }
            lastUpdateCheck = data.timestamp || new Date().toISOString();
        })
        .catch(error => {
            console.error('Error checking for updates:', error);
        });
}

function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'alert alert-info alert-dismissible fade show position-fixed';
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        <i class="fas fa-info-circle"></i> New forum activity detected.
        <button type="button" class="btn btn-sm btn-outline-info ms-2" onclick="refreshPosts()">
            Refresh Now
        </button>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 150);
        }
    }, 10000);
}

function refreshPosts() {
    showLoading('Refreshing posts...');
    setTimeout(() => {
        hideLoading();
        location.reload();
    }, 1000);
}

// =============================================================================
// STATISTICS AND ANALYTICS
// =============================================================================

function updateStatistics() {
    fetch('/api/admin/forum/statistics')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateStatCards(data.statistics);
            }
        })
        .catch(error => {
            console.error('Error updating statistics:', error);
        });
}

function updateStatCards(stats) {
    // Update stat cards if they exist
    const statCards = document.querySelectorAll('.stat-card .stat-number');
    if (statCards.length >= 4) {
        statCards[0].textContent = stats.total_posts || '0';
        statCards[1].textContent = stats.total_replies || '0';
        statCards[2].textContent = stats.flagged_posts || '0';
        statCards[3].textContent = stats.active_users || '0';
    }
}

function updateReplyCount() {
    // Update reply count in the current post view
    const repliesContainer = document.getElementById('repliesContainer');
    if (repliesContainer) {
        const replyCount = repliesContainer.querySelectorAll('.reply-item').length;
        const header = document.querySelector('h6');
        if (header && header.textContent.includes('Replies')) {
            header.textContent = `Replies (${replyCount}):`;
        }
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function resetFlagForm() {
    const form = document.getElementById('flagForm');
    if (form) {
        form.reset();
    }
    document.getElementById('flagPostId').value = '';
    document.getElementById('flagReplyId').value = '';
}

function initializeFilters() {
    // Set up filter persistence
    const filters = ['categoryFilter', 'statusFilter', 'dateFilter'];
    filters.forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            // Load saved filter value
            const savedValue = localStorage.getItem(`forum_${filterId}`);
            if (savedValue) {
                filter.value = savedValue;
            }
            
            // Save filter value on change
            filter.addEventListener('change', function() {
                localStorage.setItem(`forum_${filterId}`, this.value);
            });
        }
    });
    
    // Apply filters on load
    setTimeout(filterPosts, 100);
}

function initializeModals() {
    // Pre-load modal content and setup
    const modals = ['viewPostModal', 'flagModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            // Add modal-specific initialization if needed
        }
    });
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K for quick search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('searchPosts')?.focus();
        }
        
        // Ctrl/Cmd + R for refresh (override default)
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            refreshPosts();
        }
        
        // F for show flagged only
        if (e.key === 'f' && !e.ctrlKey && !e.metaKey && !e.altKey) {
            const activeElement = document.activeElement;
            if (!activeElement || !['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName)) {
                e.preventDefault();
                showFlaggedOnly();
            }
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal.show');
            openModals.forEach(modal => {
                bootstrap.Modal.getInstance(modal)?.hide();
            });
        }
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 150);
        }
    }, 5000);
}

function showLoading(message = 'Loading...') {
    let loadingDiv = document.getElementById('loadingOverlay');
    if (loadingDiv) {
        loadingDiv.remove();
    }
    
    loadingDiv = document.createElement('div');
    loadingDiv.id = 'loadingOverlay';
    loadingDiv.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center';
    loadingDiv.style.cssText = 'background: rgba(0,0,0,0.5); z-index: 9999;';
    loadingDiv.innerHTML = `
        <div class="bg-white p-4 rounded shadow">
            <div class="d-flex align-items-center">
                <div class="spinner-border spinner-border-sm me-3" role="status"></div>
                <span>${message}</span>
            </div>
        </div>
    `;
    
    document.body.appendChild(loadingDiv);
}

function hideLoading() {
    const loadingDiv = document.getElementById('loadingOverlay');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// =============================================================================
// BULK OPERATIONS
// =============================================================================

function initializeBulkOperations() {
    // Add bulk action controls if needed
    const tableHeader = document.querySelector('#forumTableBody').closest('table').querySelector('thead tr');
    if (tableHeader && !tableHeader.querySelector('input[type="checkbox"]')) {
        const checkboxHeader = document.createElement('th');
        checkboxHeader.innerHTML = '<input type="checkbox" id="selectAll" class="form-check-input">';
        tableHeader.insertBefore(checkboxHeader, tableHeader.firstChild);
        
        // Add checkboxes to each row
        const rows = document.querySelectorAll('#forumTableBody tr');
        rows.forEach((row, index) => {
            const checkboxCell = document.createElement('td');
            checkboxCell.innerHTML = `<input type="checkbox" class="form-check-input post-checkbox" value="${index}">`;
            row.insertBefore(checkboxCell, row.firstChild);
        });
        
        // Handle select all
        document.getElementById('selectAll').addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.post-checkbox');
            checkboxes.forEach(cb => cb.checked = this.checked);
            updateBulkActions();
        });
        
        // Handle individual checkboxes
        document.querySelectorAll('.post-checkbox').forEach(cb => {
            cb.addEventListener('change', updateBulkActions);
        });
    }
}

function updateBulkActions() {
    const selectedCount = document.querySelectorAll('.post-checkbox:checked').length;
    let bulkActionsDiv = document.getElementById('bulkActions');
    
    if (selectedCount > 0) {
        if (!bulkActionsDiv) {
            bulkActionsDiv = document.createElement('div');
            bulkActionsDiv.id = 'bulkActions';
            bulkActionsDiv.className = 'alert alert-info d-flex justify-content-between align-items-center mt-3';
            bulkActionsDiv.innerHTML = `
                <span id="bulkCount">${selectedCount} posts selected</span>
                <div>
                    <button class="btn btn-sm btn-warning me-2" onclick="bulkFlag()">
                        <i class="fas fa-flag"></i> Flag Selected
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="bulkDelete()">
                        <i class="fas fa-trash"></i> Delete Selected
                    </button>
                </div>
            `;
            document.querySelector('.forum-card').appendChild(bulkActionsDiv);
        } else {
            document.getElementById('bulkCount').textContent = `${selectedCount} posts selected`;
        }
    } else if (bulkActionsDiv) {
        bulkActionsDiv.remove();
    }
}

function bulkFlag() {
    const selectedCheckboxes = document.querySelectorAll('.post-checkbox:checked');
    if (selectedCheckboxes.length === 0) return;
    
    if (confirm(`Are you sure you want to flag ${selectedCheckboxes.length} selected posts?`)) {
        // Implementation for bulk flagging
        showNotification('Bulk flagging functionality would be implemented here', 'info');
    }
}

function bulkDelete() {
    const selectedCheckboxes = document.querySelectorAll('.post-checkbox:checked');
    if (selectedCheckboxes.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedCheckboxes.length} selected posts? This action cannot be undone.`)) {
        // Implementation for bulk deletion
        showNotification('Bulk deletion functionality would be implemented here', 'info');
    }
}

// =============================================================================
// EXPORT FUNCTIONALITY
// =============================================================================

function exportForumData() {
    const rows = document.querySelectorAll('#forumTableBody tr:not([style*="display: none"])');
    const data = [];
    
    rows.forEach(row => {
        const cells = row.cells;
        const postData = {
            title: cells[0].querySelector('.fw-bold')?.textContent || '',
            author: cells[1].textContent.trim(),
            category: cells[2].textContent.trim(),
            replies: cells[3].textContent.trim(),
            status: cells[4].textContent.trim(),
            date: cells[5].textContent.trim()
        };
        data.push(postData);
    });
    
    const csv = convertToCSV(data);
    downloadCSV(csv, 'forum-oversight-export.csv');
    showNotification('Forum data exported successfully', 'success');
}

function convertToCSV(data) {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    
    return csvContent;
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
});

// Make functions globally available
window.viewPost = viewPost;
window.toggleFlag = toggleFlag;
window.deletePost = deletePost;
window.flagPostFromModal = flagPostFromModal;
window.deletePostFromModal = deletePostFromModal;
window.flagReply = flagReply;
window.deleteReply = deleteReply;
window.refreshPosts = refreshPosts;
window.showFlaggedOnly = showFlaggedOnly;
window.exportForumData = exportForumData;

//==============================================================================
// END OF FORUM OVERSIGHT SCRIPT
//==============================================================================

// admin_analytics.js - Simple JavaScript for Analytics Dashboard
console.log('🔄 Loading Analytics JavaScript...');

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Analytics page loaded, initializing...');
    initializeCharts();
    setupEventListeners();
    startAutoRefresh();
    console.log('✅ Analytics JavaScript ready!');
});

// =============================================================================
// CHART INITIALIZATION
// =============================================================================

function initializeCharts() {
    // Chart defaults
    const chartDefaults = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            }
        }
    };

    // User Growth Chart
    if (document.getElementById('userGrowthChart')) {
        const userGrowthCtx = document.getElementById('userGrowthChart').getContext('2d');
        new Chart(userGrowthCtx, {
            type: 'line',
            data: {
                labels: window.analyticsData.userGrowth.labels,
                datasets: [{
                    label: 'New Students',
                    data: window.analyticsData.userGrowth.data,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: chartDefaults
        });
    }

    // Mood Distribution Chart
    if (document.getElementById('moodDistributionChart')) {
        const moodCtx = document.getElementById('moodDistributionChart').getContext('2d');
        new Chart(moodCtx, {
            type: 'doughnut',
            data: {
                labels: window.analyticsData.moodDistribution.labels,
                datasets: [{
                    data: window.analyticsData.moodDistribution.data,
                    backgroundColor: ['#27ae60', '#f39c12', '#e74c3c'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: chartDefaults
        });
    }

    // Appointments Chart
    if (document.getElementById('appointmentsChart')) {
        const appointmentsCtx = document.getElementById('appointmentsChart').getContext('2d');
        new Chart(appointmentsCtx, {
            type: 'bar',
            data: {
                labels: window.analyticsData.appointments.labels,
                datasets: [{
                    label: 'Appointments',
                    data: window.analyticsData.appointments.data,
                    backgroundColor: '#f39c12',
                    borderColor: '#e67e22',
                    borderWidth: 1
                }]
            },
            options: chartDefaults
        });
    }

    // Topics Chart
    if (document.getElementById('topicsChart')) {
        const topicsCtx = document.getElementById('topicsChart').getContext('2d');
        new Chart(topicsCtx, {
            type: 'pie',
            data: {
                labels: window.analyticsData.topics.labels,
                datasets: [{
                    data: window.analyticsData.topics.data,
                    backgroundColor: ['#3498db', '#e74c3c', '#f39c12', '#27ae60', '#9b59b6'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: chartDefaults
        });
    }
}

// =============================================================================
// EVENT LISTENERS
// =============================================================================

function setupEventListeners() {
    // Date range filter
    const dateRangeSelect = document.getElementById('dateRange');
    if (dateRangeSelect) {
        dateRangeSelect.addEventListener('change', function() {
            toggleCustomDateInputs(this.value === 'custom');
        });
    }

    // Apply filter button
    const applyFilterBtn = document.getElementById('applyFilter');
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', applyDateFilter);
    }

    // Refresh button
    const refreshBtn = document.getElementById('refreshAnalytics');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshAnalytics);
    }

    // Export button
    const exportBtn = document.getElementById('exportReport');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportReport);
    }
}

// =============================================================================
// FILTER FUNCTIONS
// =============================================================================

function toggleCustomDateInputs(show) {
    const dateFromInput = document.getElementById('dateFrom');
    const dateToInput = document.getElementById('dateTo');
    
    if (dateFromInput && dateToInput) {
        dateFromInput.style.display = show ? 'block' : 'none';
        dateToInput.style.display = show ? 'block' : 'none';
    }
}

function applyDateFilter() {
    const dateRange = document.getElementById('dateRange').value;
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    
    // Build URL parameters
    const params = new URLSearchParams();
    
    if (dateRange === 'custom' && dateFrom && dateTo) {
        params.set('from', dateFrom);
        params.set('to', dateTo);
    } else {
        params.set('range', dateRange);
    }
    
    // Show loading
    showLoading('Applying filter...');
    
    // Reload page with new parameters
    window.location.href = `${window.location.pathname}?${params.toString()}`;
}

// =============================================================================
// REFRESH FUNCTIONS
// =============================================================================

function refreshAnalytics() {
    const refreshBtn = document.getElementById('refreshAnalytics');
    
    // Update button state
    if (refreshBtn) {
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
        refreshBtn.disabled = true;
    }
    
    // Fetch updated data
    fetch('/api/admin/analytics/refresh')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateMetrics(data);
                showSuccess('Analytics refreshed successfully!');
            } else {
                showError('Failed to refresh analytics data');
            }
        })
        .catch(error => {
            console.error('Refresh error:', error);
            showError('Error refreshing data');
        })
        .finally(() => {
            // Reset button
            if (refreshBtn) {
                refreshBtn.innerHTML = '<i class="fas fa-sync"></i> Refresh';
                refreshBtn.disabled = false;
            }
        });
}

function updateMetrics(data) {
    // Update metric displays
    const metrics = {
        'totalStudents': data.total_students,
        'activeCounselors': data.active_counselors,
        'totalAppointments': data.total_appointments,
        'totalAssessments': data.total_assessments,
        'forumActivity': data.forum_posts,
        'activeUsers': data.active_users_7days
    };
    
    // Update each metric with animation
    Object.keys(metrics).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            animateNumber(element, parseInt(element.textContent), metrics[id]);
        }
    });
}

function animateNumber(element, start, end) {
    const duration = 1000; // 1 second
    const range = end - start;
    const increment = range / (duration / 16); // 60fps
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.round(current);
    }, 16);
}

// =============================================================================
// AUTO REFRESH
// =============================================================================

function startAutoRefresh() {
    // Auto-refresh every 5 minutes
    setInterval(() => {
        fetch('/api/admin/analytics/refresh')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updateMetrics(data);
                    console.log('Analytics auto-refreshed at', new Date().toLocaleTimeString());
                }
            })
            .catch(error => {
                console.error('Auto-refresh failed:', error);
            });
    }, 300000); // 5 minutes
}

// =============================================================================
// EXPORT FUNCTIONS
// =============================================================================

function exportReport() {
    const exportBtn = document.getElementById('exportReport');
    
    // Update button state
    if (exportBtn) {
        exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
        exportBtn.disabled = true;
    }
    
    // Open export URL in new tab
    window.open('/admin/analytics/export', '_blank');
    
    // Reset button after delay
    setTimeout(() => {
        if (exportBtn) {
            exportBtn.innerHTML = '<i class="fas fa-download"></i> Export Report';
            exportBtn.disabled = false;
        }
    }, 2000);
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function showLoading(message = 'Loading...') {
    // Create or update loading overlay
    let overlay = document.getElementById('loadingOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            color: white;
            font-size: 1.2rem;
        `;
        document.body.appendChild(overlay);
    }
    
    overlay.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i>${message}`;
    overlay.style.display = 'flex';
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        min-width: 300px;
    `;
    
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// =============================================================================
// CHART UTILITY FUNCTIONS
// =============================================================================

function updateChartData(chartId, newData) {
    const chart = Chart.getChart(chartId);
    if (chart) {
        chart.data.datasets[0].data = newData;
        chart.update('none'); // Update without animation for performance
    }
}

function resizeCharts() {
    // Resize all charts when window resizes
    Chart.helpers.each(Chart.instances, function(instance) {
        instance.resize();
    });
}

// Handle window resize
window.addEventListener('resize', resizeCharts);

// =============================================================================
// PERFORMANCE MONITORING
// =============================================================================

function trackPagePerformance() {
    // Track page load time
    window.addEventListener('load', function() {
        const loadTime = performance.now();
        console.log(`Analytics page loaded in ${loadTime.toFixed(2)}ms`);
        
        // Send to analytics endpoint if needed
        // fetch('/api/analytics/performance', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ page: 'analytics', loadTime: loadTime })
        // });
    });
}

// Initialize performance tracking
trackPagePerformance();

// =============================================================================
// KEYBOARD SHORTCUTS
// =============================================================================

document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + R for refresh
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        refreshAnalytics();
    }
    
    // Ctrl/Cmd + E for export
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportReport();
    }
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

window.addEventListener('error', function(e) {
    console.error('Analytics page error:', e.error);
    showError('An error occurred. Please refresh the page.');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    showError('An error occurred while loading data.');
});

console.log('✅ Analytics JavaScript initialized successfully!');
