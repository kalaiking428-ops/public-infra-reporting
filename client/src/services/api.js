const API_BASE = '/api';

export const api = {
  // Get list of issues with optional filters
  async getIssues(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.category_id && filters.category_id !== 'all') params.append('category_id', filters.category_id);
    if (filters.department_id && filters.department_id !== 'all') params.append('department_id', filters.department_id);
    if (filters.priority && filters.priority !== 'all') params.append('priority', filters.priority);
    if (filters.search) params.append('search', filters.search);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/issues${query}`);
    if (!res.ok) throw new Error('Failed to fetch issues');
    return res.json();
  },

  // Get single issue with full timeline
  async getIssueById(id) {
    const res = await fetch(`${API_BASE}/issues/${encodeURIComponent(id)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Issue not found');
    }
    return res.json();
  },

  // Get categories
  async getCategories() {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  // Get departments
  async getDepartments() {
    const res = await fetch(`${API_BASE}/departments`);
    if (!res.ok) throw new Error('Failed to fetch departments');
    return res.json();
  },

  // Get analytics stats
  async getStats() {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Failed to fetch statistics');
    return res.json();
  },

  // Create issue (FormData for multipart file upload)
  async createIssue(formData) {
    const res = await fetch(`${API_BASE}/issues`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit issue');
    }
    return res.json();
  },

  // Admin update status/dept/officer
  async updateIssueStatus(id, formDataOrJson) {
    let options = {
      method: 'PATCH'
    };

    if (formDataOrJson instanceof FormData) {
      options.body = formDataOrJson;
    } else {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(formDataOrJson);
    }

    const res = await fetch(`${API_BASE}/issues/${encodeURIComponent(id)}/status`, options);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update status');
    }
    return res.json();
  },

  // Upvote issue
  async upvoteIssue(id) {
    const res = await fetch(`${API_BASE}/issues/${encodeURIComponent(id)}/upvote`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to upvote');
    return res.json();
  },

  // Submit citizen satisfaction feedback
  async submitFeedback(id, data) {
    const res = await fetch(`${API_BASE}/issues/${encodeURIComponent(id)}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to submit feedback');
    return res.json();
  },

  // Reverse geocode coordinate to human-readable address
  async reverseGeocode(lat, lng) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'Accept-Language': 'en'
          }
        }
      );
      if (res.ok) {
        const data = await res.json();
        return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      }
    } catch {
      // Fallback
    }
    return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  }
};
