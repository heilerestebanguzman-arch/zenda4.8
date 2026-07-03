import axios from 'axios';
import { Ticket } from '../types/ticket';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export const api = {
  async getTickets(): Promise<Ticket[]> {
    const response = await axios.get(`${API_BASE_URL}/api/v1/tickets`);
    return response.data.tickets;
  },

  async getTicketsByStatus(status: string): Promise<Ticket[]> {
    const response = await axios.get(`${API_BASE_URL}/api/v1/tickets/status/${status}`);
    return response.data.tickets;
  },

  async getTicketsBySeverity(severity: string): Promise<Ticket[]> {
    const response = await axios.get(`${API_BASE_URL}/api/v1/tickets/severity/${severity}`);
    return response.data.tickets;
  },

  async getCriticalOpen(): Promise<Ticket[]> {
    const response = await axios.get(`${API_BASE_URL}/api/v1/tickets/critical/open`);
    return response.data.tickets;
  },
};
