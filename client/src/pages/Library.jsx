import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Clock, ArrowLeft } from 'lucide-react';

export default function Library() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/books')
            .then(res => res.json())
            .then(data => {
                setBooks(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 relative overflow-x-hidden">
            {/* Background */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black z-0 pointer-events-none"></div>

            <div className="relative z-10 max-w-7xl mx-auto">
                <header className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-3xl font-bold tracking-tight">Library</h1>
                    </div>
                    <div className="text-sm text-white/40 uppercase tracking-widest">
                        {books.length} Books
                    </div>
                </header>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    </div>
                ) : books.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <Book className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="text-xl">Your library is empty.</p>
                        <p className="text-sm mt-2">Start reading to add books here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {books.map((book) => (
                            <div
                                key={book.id}
                                onClick={() => navigate(`/read?url=${encodeURIComponent(book.latestChapter.url)}`)}
                                className="group relative bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-2xl p-6 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-2xl"
                            >
                                <div className="aspect-[2/3] bg-gradient-to-br from-gray-800 to-black rounded-xl mb-4 overflow-hidden relative shadow-lg group-hover:shadow-purple-500/20 transition-shadow">
                                    <div className="absolute inset-0 flex items-center justify-center text-white/10 group-hover:text-white/20 transition-colors">
                                        <Book className="w-12 h-12" />
                                    </div>
                                    {/* Placeholder for cover if we had one */}
                                    <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
                                        <span className="text-xs font-mono text-purple-300">
                                            {book.url.split('/b/')[1]?.split('/')[0] || 'NOVEL'}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold leading-tight mb-2 line-clamp-2 group-hover:text-purple-200 transition-colors">
                                    {book.title}
                                </h3>

                                <div className="flex items-center gap-2 text-xs text-white/40 mt-4">
                                    <Clock className="w-3 h-3" />
                                    <span className="truncate">Last: {book.latestChapter.title}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
