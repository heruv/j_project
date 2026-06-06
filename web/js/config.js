const CONFIG = {
    API_URL: 'http://localhost:8081/myapp/api',
    
     ENDPOINTS: {
        EVENTS: '/events',
        EVENT_BY_ID: function(id) { return '/events/' + id; },
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        PROFILE: '/auth/profile',
        CHAT: function(eventId)   { return '/events/' + eventId + '/chat'; },
        INVITE: function(eventId) { return '/events/' + eventId + '/invite'; },
        JOIN: function(eventId)   { return '/events/' + eventId + '/join'; }
    }
};