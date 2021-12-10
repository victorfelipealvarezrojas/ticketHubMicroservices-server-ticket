import express, { Request, Response } from 'express';
import { NotFounError } from '@ticketshub/commun';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get("/api/tickets/:id", async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        throw new NotFounError();
    }

    res.send(ticket);
});

export { router as showTicketRouter };