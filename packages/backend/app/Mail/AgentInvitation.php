<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\CompanyAgent;

class AgentInvitation extends Mailable
{
    use Queueable, SerializesModels;

    public $companyAgent;
    public $invitationToken;
    public $invitationUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(CompanyAgent $companyAgent, string $invitationToken)
    {
        $this->companyAgent = $companyAgent;
        $this->invitationToken = $invitationToken;
        $this->invitationUrl = config('app.frontend_url') . '/agent/accept-invitation?token=' . $invitationToken;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'You\'ve been invited to join ' . $this->companyAgent->company->company_name . ' as an Agent',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.agent-invitation',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
