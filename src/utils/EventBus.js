/**
 * Event bus for pub/sub communication between modules
 * Helps decouple components through event-based messaging
 */
class EventBus {
    constructor() {
        this.events = {};
    }
    
    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {Function} callback - Event handler
     */
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        
        // Return unsubscribe function
        return () => {
            this.off(event, callback);
        };
    }
    
    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {Function} callback - Event handler to remove
     */
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event]
                .filter(cb => cb !== callback);
        }
    }
    
    /**
     * Emit an event with data
     * @param {string} event - Event name
     * @param {...any} args - Event data
     */
    emit(event, ...args) {
        if (this.events[event]) {
            this.events[event].forEach(callback => {
                callback(...args);
            });
        }
    }
    
    /**
     * Clear all events of a specific type
     * @param {string} event - Event name
     */
    clear(event) {
        if (event) {
            this.events[event] = [];
        } else {
            this.events = {};
        }
    }
}

export default EventBus;