import { Publisher, Subjects, TicketCreatedEvent } from "@ticketshub/commun";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
}

