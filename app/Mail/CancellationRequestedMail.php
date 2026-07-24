<?php

namespace App\Mail;

use App\Models\CancellationRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CancellationRequestedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public CancellationRequest $cancellation
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "[SimplePOS] Permintaan Pembatalan - {$this->cancellation->warung_name}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.cancellation_requested',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
