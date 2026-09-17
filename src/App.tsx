import { useEffect, useState } from 'react'
import { createClient, type Session } from '@supabase/supabase-js'
import { Activity, ArrowUpRight, Code2, Database, FileUp, LogIn, LogOut, Plus, Radio, ShieldCheck, Trash2, UserRound, X } from 'lucide-react'
import './App.css'

type Note = { id: string; title: string; body: string; created_at: string }
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null
const demoNotes: Note[] = [
  { id: '1', title: 'Read the auth docs', body: 'Create a test user, then inspect the session returned by signInWithPassword.', created_at: '2026-09-16T08:30:00.000Z' },
  { id: '2', title: 'Try Row Level Security', body: 'Change the policy and observe how the same query behaves for another user.', created_at: '2026-09-15T13:10:00.000Z' },
]

function App() {
  const [notes, setNotes] = useState<Note[]>(demoNotes)
  const [session, setSession] = useState<Session | null>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newNote, setNewNote] = useState({ title: '', body: '' })
  const [message, setMessage] = useState('Demo mode: connect a project to make it live.')
  const [uploadName, setUploadName] = useState('')

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, currentSession) => setSession(currentSession))
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!supabase) return
    const loadNotes = async () => {
      const { data, error } = await supabase.from('notes').select('id, title, body, created_at').order('created_at', { ascending: false })
      if (!error && data) setNotes(data)
    }
    loadNotes()
    const channel = supabase.channel('notes-live').on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, loadNotes).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [session])

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!supabase) { setMessage('Add your Supabase environment variables first.'); return }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setMessage(error ? error.message : 'Signed in successfully.')
  }
  const signUp = async () => {
    if (!supabase) { setMessage('Add your Supabase environment variables first.'); return }
    const { error } = await supabase.auth.signUp({ email, password })
    setMessage(error ? error.message : 'Check your inbox to confirm your account.')
  }
  const addNote = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!newNote.title.trim()) return
    if (supabase && session) {
      const { error } = await supabase.from('notes').insert({ ...newNote, user_id: session.user.id })
      setMessage(error ? error.message : 'Note synced to Postgres.')
    } else {
      setNotes([{ ...newNote, id: crypto.randomUUID(), created_at: new Date().toISOString() }, ...notes])
      setMessage('Demo note added locally. Sign in to persist it.')
    }
    setNewNote({ title: '', body: '' })
  }
  const deleteNote = async (id: string) => {
    if (supabase && session) await supabase.from('notes').delete().eq('id', id)
    setNotes(notes.filter((note) => note.id !== id))
  }
  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploadName(file.name)
    if (supabase && session) {
      const path = `${session.user.id}/${Date.now()}-${file.name}`
      const { error } = await supabase.storage.from('practice-files').upload(path, file)
      setMessage(error ? error.message : 'File uploaded to Storage.')
    } else setMessage('Demo upload selected. Sign in to send it to Storage.')
  }

  return <main className="app-shell">
    <header className="topbar"><a className="brand" href="/"><span className="brand-mark"><Database size={18} /></span><span>supabase<span className="brand-dot">.</span>lab</span></a><div className="top-actions"><span className={supabase ? 'connection live' : 'connection'}><span className="status-dot" />{supabase ? 'Connected' : 'Local practice mode'}</span>{session ? <button className="icon-button" title="Sign out" onClick={() => supabase?.auth.signOut()}><LogOut size={18} /></button> : <button className="button button-dark" onClick={() => setAuthOpen(true)}><LogIn size={16} /> Sign in</button>}</div></header>
    <section className="intro"><div><p className="eyebrow">SUPABASE PRACTICE CONSOLE / 01</p><h1>Build the habit<br /><em>of shipping data.</em></h1><p className="lede">A small playground for learning the Supabase workflow end to end. Connect a project, run the schema, and start making changes you can see.</p></div><div className="intro-art"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="signal-card"><Radio size={18} /><strong>{supabase ? 'Realtime ready' : 'Waiting for a project'}</strong><span>listen -&gt; change -&gt; learn</span></div></div></section>
    <div className="notice"><Activity size={16} /><span>{message}</span><a href="https://supabase.com/dashboard" target="_blank">Open Supabase <ArrowUpRight size={14} /></a></div>
    <section className="workspace"><aside className="sidebar"><p className="side-label">YOUR WORKBENCH</p><nav><a className="active" href="#notes"><Database size={16} /> Notes / CRUD</a><a href="#auth"><ShieldCheck size={16} /> Auth &amp; policies</a><a href="#storage"><FileUp size={16} /> Storage</a><a href="#realtime"><Radio size={16} /> Realtime</a></nav><div className="progress"><div className="progress-head"><span>Practice path</span><strong>1 / 4</strong></div><div className="progress-bar"><span /></div><p>Start with CRUD, then turn on auth and RLS.</p></div></aside><div className="content"><section id="notes" className="module"><div className="module-head"><div><span className="module-number">01</span><h2>Notes / CRUD</h2><p>Write to a table, read it back, then delete it. The basics are the whole point.</p></div><span className="pill"><span className="status-dot" />{notes.length} records</span></div><form className="note-form" onSubmit={addNote}><input aria-label="Note title" placeholder="A note worth remembering" value={newNote.title} onChange={(event) => setNewNote({ ...newNote, title: event.target.value })} /><input aria-label="Note body" placeholder="What did you learn?" value={newNote.body} onChange={(event) => setNewNote({ ...newNote, body: event.target.value })} /><button className="button button-orange" title="Add note"><Plus size={17} /> Add note</button></form><div className="notes-list">{notes.map((note, index) => <article className="note-row" key={note.id}><div className="note-index">{String(index + 1).padStart(2, '0')}</div><div className="note-copy"><h3>{note.title}</h3><p>{note.body}</p></div><time>{new Date(note.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</time><button className="icon-button muted" title="Delete note" onClick={() => deleteNote(note.id)}><Trash2 size={16} /></button></article>)}</div></section><section id="storage" className="module split-module"><div><span className="module-number">02</span><h2>Storage bucket</h2><p>Upload an avatar, screenshot, or any file. Your first bucket is a useful little mystery.</p></div><label className="dropzone"><FileUp size={22} /><strong>{uploadName || 'Choose a file'}</strong><span>private bucket / practice-files</span><input type="file" onChange={uploadFile} /></label></section><section id="realtime" className="module mini-module"><div className="mini-icon"><Radio size={19} /></div><div><span className="module-number">03</span><h2>Realtime channel</h2><p>{supabase ? 'Listening to notes changes from every connected client.' : 'Connect your project to watch database changes arrive instantly.'}</p></div><span className="live-label"><span className="status-dot" /> Listening</span></section></div></section>
    <footer><span>Made for deliberate practice.</span><a href="https://github.com/supabase/supabase" target="_blank"><Code2 size={15} /> Supabase on GitHub</a></footer>
    {authOpen && <div className="modal-backdrop" onClick={() => setAuthOpen(false)}><div className="modal" onClick={(event) => event.stopPropagation()}><button className="close-button" title="Close" onClick={() => setAuthOpen(false)}><X size={18} /></button><UserRound size={28} /><h2>Welcome back</h2><p>Use an email and password from your Supabase Auth users.</p><form onSubmit={signIn}><input type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required /><input type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} required /><button className="button button-dark" type="submit">Sign in <ArrowUpRight size={16} /></button></form><button className="text-button" onClick={signUp}>Create a new account</button></div></div>}
  </main>
}

export default App
