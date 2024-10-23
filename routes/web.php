<?php

use App\Http\Controllers\PostController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

/**
 * Web Pages Routes
 */
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');


/**
 * API Call
 */
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Disable browser parameter request (only axios or fetch hit)
Route::middleware(['auth', 'ajax'])->group(function () {
    /**
     * Post Audio Routes 
     */
    Route::get('/post', [PostController::class, 'index'])->name('post.index'); // Fetch and list posts
    Route::get('/post/create', [PostController::class, 'create'])->name('post.create'); // Create form
    Route::get('/post/{id}/edit', [PostController::class, 'edit'])->name('post.edit'); // Edit form
    Route::get('/post/{id}', [PostController::class, 'show'])->name('post.show'); // Show post details
    Route::post('/post/store', [PostController::class, 'store'])->name('post.store');
    Route::get('/post/download/{id}', [PostController::class, 'download'])->name('post.download');
    Route::get('/post/batch-download', [PostController::class, 'batchDownload'])->name('post.batch-download');
    Route::post('/post/batch-store', [PostController::class, 'batchStore'])->name('post.batch-store');

    /**
     * Get Audio Blob
     */
    Route::post('/audio', [PostController::class, 'getAudio'])->name('post.audio');
});

Route::middleware(['auth', 'ajax', 'role.check'])->group(function () {
    /**
     * Admin Routes
     */
    Route::put('/post/{id}', [PostController::class, 'update'])->name('post.update');
    Route::delete('/post/{id}', [PostController::class, 'destroy'])->name('post.destroy');
});

require __DIR__ . '/auth.php';
