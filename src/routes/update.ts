import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  ValidateRequest,
  NotFounError,
  RequireAuth,
  NotAuthorizedError,
  BadRequestError,
} from '@ticketshub/commun';
import { Ticket } from '../models/ticket';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updarted-publisher';
import { natsWrapper } from '../../nats-wrapper';

const router = express.Router();

router.put(
  "/api/tickets/:id",
  RequireAuth,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be provided and must be greater than 0'),
  ],
  ValidateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFounError();
    }

    //no puedo editar ticket reservados
    if (ticket.orderId) {
      throw new BadRequestError('Ticket reseved not edit');
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    ticket.set({
      title: req.body.title,
      price: req.body.price,
    });
    await ticket.save();

    //envio al bus de eventos, es una publicacion
    await new TicketUpdatedPublisher(natsWrapper.getClient).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });

    res.send(ticket);
  }
);

export { router as updateTicketRouter };
