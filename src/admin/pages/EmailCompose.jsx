/**
 * Email Compose Page
 * Rich text editor for composing and sending emails
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Send,
  X,
  Paperclip,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Loader2,
  AlertCircle,
  ChevronLeft,
  Trash2,
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';

// API URL with fallback to AWS API Gateway
const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://gtafs0o8rd.execute-api.eu-central-1.amazonaws.com/dev';

export default function EmailCompose() {
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [subject, setSubject] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showCc, setShowCc] = useState(false);
  const [replyToEmail, setReplyToEmail] = useState(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getIdToken } = useAuth();

  const replyToId = searchParams.get('replyTo');

  // Initialize TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Write your message...',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class:
          'prose prose-invert max-w-none focus:outline-none min-h-[200px] px-4 py-3',
      },
    },
  });

  // Fetch reply-to email if provided
  useEffect(() => {
    if (replyToId) {
      fetchReplyToEmail(replyToId);
    }
  }, [replyToId]);

  const fetchReplyToEmail = async (id) => {
    try {
      const token = await getIdToken();
      const response = await fetch(`${API_URL}/admin/emails/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const email = data.data?.email;
        if (email) {
          setReplyToEmail(email);
          setTo(email.from?.email || '');
          setSubject(`Re: ${email.subject || ''}`);

          // Set quoted reply content
          if (editor) {
            const quotedContent = `
              <br><br>
              <p>---</p>
              <p>On ${new Date(email.createdAt).toLocaleString()}, ${
              email.from?.name || email.from?.email
            } wrote:</p>
              <blockquote>${email.body || email.bodyText || ''}</blockquote>
            `;
            editor.commands.setContent(quotedContent);
            editor.commands.focus('start');
          }
        }
      }
    } catch (err) {
      console.error('Error fetching reply-to email:', err);
    }
  };

  const handleSend = async () => {
    // Validate
    if (!to.trim()) {
      setError('Please enter a recipient');
      return;
    }
    if (!subject.trim()) {
      setError('Please enter a subject');
      return;
    }
    if (!editor?.getHTML() || editor.isEmpty) {
      setError('Please enter a message');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const token = await getIdToken();

      const emailData = {
        to: to.split(',').map((e) => e.trim()),
        cc: cc ? cc.split(',').map((e) => e.trim()) : [],
        subject: subject.trim(),
        body: editor.getHTML(),
        bodyText: editor.getText(),
        inReplyTo: replyToEmail?.messageId || null,
      };

      const response = await fetch(`${API_URL}/admin/emails/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send email');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/email');
      }, 1500);
    } catch (err) {
      console.error('Error sending email:', err);
      setError(err.message || 'Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  const handleDiscard = () => {
    if (
      editor?.isEmpty &&
      !to &&
      !subject
    ) {
      navigate('/admin/email');
      return;
    }

    if (window.confirm('Discard this draft?')) {
      navigate('/admin/email');
    }
  };

  const addLink = useCallback(() => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/email')}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {replyToEmail ? 'Reply' : 'New Email'}
              </h1>
              <p className="text-gray-400 mt-1">
                Compose and send your message
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDiscard}
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Discard
            </button>
            <button
              onClick={handleSend}
              disabled={isSending}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success message */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-green-400">Email sent successfully!</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Compose form */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {/* To field */}
          <div className="flex items-center border-b border-gray-800">
            <label className="px-4 py-3 text-sm text-gray-400 w-16">To:</label>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              className="flex-1 px-2 py-3 bg-transparent text-white placeholder-gray-500 focus:outline-none"
            />
            {!showCc && (
              <button
                onClick={() => setShowCc(true)}
                className="px-4 py-3 text-sm text-gray-400 hover:text-white"
              >
                Cc
              </button>
            )}
          </div>

          {/* Cc field */}
          {showCc && (
            <div className="flex items-center border-b border-gray-800">
              <label className="px-4 py-3 text-sm text-gray-400 w-16">Cc:</label>
              <input
                type="text"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder="cc@example.com"
                className="flex-1 px-2 py-3 bg-transparent text-white placeholder-gray-500 focus:outline-none"
              />
              <button
                onClick={() => {
                  setShowCc(false);
                  setCc('');
                }}
                className="px-4 py-3 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Subject field */}
          <div className="flex items-center border-b border-gray-800">
            <label className="px-4 py-3 text-sm text-gray-400 w-16">
              Subject:
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              className="flex-1 px-2 py-3 bg-transparent text-white placeholder-gray-500 focus:outline-none"
            />
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-800 bg-gray-800/50">
            <button
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={`p-2 rounded hover:bg-gray-700 transition-colors ${
                editor?.isActive('bold') ? 'bg-gray-700 text-white' : 'text-gray-400'
              }`}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={`p-2 rounded hover:bg-gray-700 transition-colors ${
                editor?.isActive('italic') ? 'bg-gray-700 text-white' : 'text-gray-400'
              }`}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-700 mx-1" />
            <button
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded hover:bg-gray-700 transition-colors ${
                editor?.isActive('bulletList')
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400'
              }`}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded hover:bg-gray-700 transition-colors ${
                editor?.isActive('orderedList')
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400'
              }`}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-700 mx-1" />
            <button
              onClick={addLink}
              className={`p-2 rounded hover:bg-gray-700 transition-colors ${
                editor?.isActive('link') ? 'bg-gray-700 text-white' : 'text-gray-400'
              }`}
              title="Add Link"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            <button
              className="p-2 rounded text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
              title="Attach File (Coming soon)"
              disabled
            >
              <Paperclip className="w-4 h-4" />
            </button>
          </div>

          {/* Editor */}
          <div className="min-h-[300px]">
            <EditorContent editor={editor} />
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-800 bg-gray-800/30">
            <p className="text-xs text-gray-500">
              Sending as <span className="text-gray-400">support@philocom.co</span>
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
