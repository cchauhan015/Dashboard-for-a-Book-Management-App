import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
// Inline SVG icons for a single-file app
const EditIcon = ({ className }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <path d='M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z' />
    <path d='m15 5 4 4' />
  </svg>
);

const TrashIcon = ({ className }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <path d='M3 6h18' />
    <path d='M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' />
    <path d='M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' />
  </svg>
);

const XIcon = ({ className }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <path d='M18 6 6 18' />
    <path d='m6 6 12 12' />
  </svg>
);

const PlusIcon = ({ className }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <path d='M5 12h14' />
    <path d='M12 5v14' />
  </svg>
);

const CheckCircleIcon = ({ className }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <path d='M22 11.08V12a10 10 0 1 1-5.93-8.5' />
    <path d='m9 11 3 3L22 4' />
  </svg>
);

const InfoIcon = ({ className }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <circle cx='12' cy='12' r='10' />
    <path d='M12 16v-4' />
    <path d='M12 8h.01' />
  </svg>
);

// Custom toast notification component
const ToastMessage = ({ message, type }) => {
  const baseClasses =
    'flex items-center space-x-2 p-4 rounded-lg shadow-lg text-white font-medium';
  let typeClasses = '';
  let icon = null;

  switch (type) {
    case 'success':
      typeClasses = 'bg-green-500';
      icon = <CheckCircleIcon className='w-5 h-5' />;
      break;
    case 'info':
      typeClasses = 'bg-blue-500';
      icon = <InfoIcon className='w-5 h-5' />;
      break;
    default:
      typeClasses = 'bg-gray-500';
      break;
  }

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      {icon}
      <span>{message}</span>
    </div>
  );
};

// Custom hook for toast notifications
const useToast = () => {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = useCallback((message, type) => {
    setToast({ message, type });
  }, []);

  return { toast, showToast };
};

// Configuration constants
const API_URL = 'http://localhost:5000/books';
const BOOKS_PER_PAGE = 10;
const GENRES = [
  'Fiction',
  'Non-Fiction',
  'Science Fiction',
  'Fantasy',
  'Biography',
  'Mystery',
  'Thriller',
  'Horror',
];
const STATUSES = ['Available', 'Issued'];

const generateRandomId = () => Math.random().toString(36).substring(2, 9);

// Custom Confirmation Modal
const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4'>
      <div className='bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm'>
        <h2 className='text-xl font-bold mb-4 text-gray-800'>Confirm Action</h2>
        <p className='mb-6 text-gray-600'>{message}</p>
        <div className='flex justify-end space-x-2'>
          <button
            onClick={onCancel}
            className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition'
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition'
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// Book Form Modal using react-hook-form
const BookFormModal = ({ isOpen, onClose, book, onSave }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      author: '',
      genre: '',
      year: '',
      status: 'Available',
    },
  });

  useEffect(() => {
    if (book) {
      reset(book);
    } else {
      reset({
        title: '',
        author: '',
        genre: '',
        year: '',
        status: 'Available',
      });
    }
  }, [book, reset]);

  const onSubmit = data => {
    onSave({ ...data, id: book?.id || generateRandomId() });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 sm:p-0'>
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative'>
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors'
        >
          <XIcon className='w-6 h-6' />
        </button>
        <h2 className='text-2xl font-bold mb-4 text-gray-800'>
          {book ? 'Edit Book' : 'Add New Book'}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Title
            </label>
            <Controller
              name='title'
              control={control}
              rules={{ required: 'Title is required' }}
              render={({ field }) => (
                <input
                  {...field}
                  type='text'
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
                />
              )}
            />
            {errors.title && (
              <p className='text-red-500 text-xs mt-1'>
                {errors.title.message}
              </p>
            )}
          </div>
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Author
            </label>
            <Controller
              name='author'
              control={control}
              rules={{ required: 'Author is required' }}
              render={({ field }) => (
                <input
                  {...field}
                  type='text'
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
                />
              )}
            />
            {errors.author && (
              <p className='text-red-500 text-xs mt-1'>
                {errors.author.message}
              </p>
            )}
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Genre
              </label>
              <Controller
                name='genre'
                control={control}
                rules={{ required: 'Genre is required' }}
                render={({ field }) => (
                  <select
                    {...field}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
                  >
                    <option value=''>Select Genre</option>
                    {GENRES.map(g => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.genre && (
                <p className='text-red-500 text-xs mt-1'>
                  {errors.genre.message}
                </p>
              )}
            </div>
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Publication Year
              </label>
              <Controller
                name='year'
                control={control}
                rules={{
                  required: 'Year is required',
                  pattern: {
                    value: /^\d{4}$/,
                    message: 'Please enter a valid 4-digit year',
                  },
                }}
                render={({ field }) => (
                  <input
                    {...field}
                    type='number'
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
                  />
                )}
              />
              {errors.year && (
                <p className='text-red-500 text-xs mt-1'>
                  {errors.year.message}
                </p>
              )}
            </div>
          </div>
          <div className='mb-6'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Status
            </label>
            <Controller
              name='status'
              control={control}
              rules={{ required: 'Status is required' }}
              render={({ field }) => (
                <select
                  {...field}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.status && (
              <p className='text-red-500 text-xs mt-1'>
                {errors.status.message}
              </p>
            )}
          </div>
          <button
            type='submit'
            className='w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition transform hover:scale-105'
          >
            Save Book
          </button>
        </form>
      </div>
    </div>
  );
};

// Main Book Card Component
const BookCard = ({ book, onEdit, onDelete }) => (
  <div className='bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow flex flex-col justify-between'>
    <div>
      <h3 className='text-xl font-bold text-gray-900 mb-1'>{book.title}</h3>
      <p className='text-sm text-gray-500 mb-3'>by {book.author}</p>
      <div className='mt-2 text-sm text-gray-600 space-y-1'>
        <p>
          <span className='font-semibold'>Genre:</span> {book.genre}
        </p>
        <p>
          <span className='font-semibold'>Published:</span> {book.year}
        </p>
        <p>
          <span className='font-semibold'>Status:</span> {book.status}
        </p>
      </div>
    </div>
    <div className='mt-4 flex space-x-2'>
      <button
        onClick={() => onEdit(book)}
        className='flex-1 bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-yellow-500 transition-colors flex items-center justify-center space-x-1'
      >
        <EditIcon className='w-4 h-4' />
        <span className='hidden sm:inline'>Edit</span>
      </button>
      <button
        onClick={() => onDelete(book)}
        className='flex-1 bg-red-400 text-red-900 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-red-500 transition-colors flex items-center justify-center space-x-1'
      >
        <TrashIcon className='w-4 h-4' />
        <span className='hidden sm:inline'>Delete</span>
      </button>
    </div>
  </div>
);

// Main App component
const App = () => {
  const [books, setBooks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { toast, showToast } = useToast();

  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch books');
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      showToast('Failed to load books. Please start the JSON server.', 'info');
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = selectedGenre === '' || book.genre === selectedGenre;
      const matchesStatus =
        selectedStatus === '' || book.status === selectedStatus;
      return matchesSearch && matchesGenre && matchesStatus;
    });
  }, [books, searchQuery, selectedGenre, selectedStatus]);

  const totalPages = Math.ceil(filteredBooks.length / BOOKS_PER_PAGE);
  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * BOOKS_PER_PAGE;
    const endIndex = startIndex + BOOKS_PER_PAGE;
    return filteredBooks.slice(startIndex, endIndex);
  }, [filteredBooks, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedGenre, selectedStatus]);

  const handleSaveBook = async bookData => {
    try {
      if (currentBook) {
        // Update an existing book
        const response = await fetch(`${API_URL}/${bookData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookData),
        });
        if (!response.ok) throw new Error('Failed to update book');
        showToast('Book updated successfully!', 'success');
      } else {
        // Add a new book
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookData),
        });
        if (!response.ok) throw new Error('Failed to add book');
        showToast('New book added successfully!', 'success');
      }
      fetchBooks(); // Re-fetch data after a successful save
    } catch (error) {
      showToast('Failed to save book.', 'info');
      console.error('Save error:', error);
    }
  };

  const handleDeleteBook = book => {
    setBookToDelete(book);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/${bookToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete book');
      showToast('Book deleted successfully!', 'info');
      fetchBooks(); // Re-fetch data after a successful delete
    } catch (error) {
      showToast('Failed to delete book.', 'info');
      console.error('Delete error:', error);
    } finally {
      setIsConfirmModalOpen(false);
      setBookToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmModalOpen(false);
    setBookToDelete(null);
  };

  const openAddModal = () => {
    setCurrentBook(null);
    setIsModalOpen(true);
  };

  const openEditModal = book => {
    setCurrentBook(book);
    setIsModalOpen(true);
  };

  return (
    <div className='min-h-screen bg-gray-100 font-sans p-4 sm:p-8'>
      <div className='fixed top-4 right-4 z-50'>
        {toast && <ToastMessage message={toast.message} type={toast.type} />}
      </div>

      <header className='flex flex-col sm:flex-row justify-between items-center mb-8'>
        <h1 className='text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 sm:mb-0'>
          Book Dashboard
        </h1>
        <button
          onClick={openAddModal}
          className='bg-blue-600 text-white font-semibold py-2 px-6 rounded-full shadow-lg hover:bg-blue-700 transition transform hover:scale-105 flex items-center space-x-2'
        >
          <PlusIcon className='w-5 h-5' />
          <span>Add New Book</span>
        </button>
      </header>

      {/* Search and Filter Section */}
      <div className='bg-white rounded-xl shadow-lg p-6 mb-8 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4'>
        <input
          type='text'
          placeholder='Search by title or author...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className='w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
        />
        <select
          value={selectedGenre}
          onChange={e => setSelectedGenre(e.target.value)}
          className='w-full md:w-1/4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
        >
          <option value=''>All Genres</option>
          {GENRES.map(g => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          className='w-full md:w-1/4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
        >
          <option value=''>All Statuses</option>
          {STATUSES.map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className='text-center p-16 rounded-xl bg-gray-200 text-gray-500 font-medium text-lg animate-pulse'>
          Loading books...
        </div>
      ) : paginatedBooks.length > 0 ? (
        <>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {paginatedBooks.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onEdit={openEditModal}
                onDelete={handleDeleteBook}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className='flex justify-center items-center mt-8 space-x-2'>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className='px-4 py-2 rounded-lg bg-gray-300 disabled:opacity-50'
              >
                Previous
              </button>
              <span className='text-gray-700 font-medium'>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage(prev => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className='px-4 py-2 rounded-lg bg-gray-300 disabled:opacity-50'
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className='text-center p-16 rounded-xl bg-gray-200 text-gray-500 font-medium text-lg'>
          No books found matching your criteria.
        </div>
      )}

      {/* Modals */}
      <BookFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        book={currentBook}
        onSave={handleSaveBook}
      />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        message={`Are you sure you want to delete "${bookToDelete?.title}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default App;
