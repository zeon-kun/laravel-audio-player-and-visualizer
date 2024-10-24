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
    Route::get('/post/index/me', [PostController::class, 'index'])->name('post.index');
    Route::get('/post/{id}', [PostController::class, 'show'])->name('post.show');
    Route::post('/post/store', [PostController::class, 'store'])->name('post.store');
    Route::put('/post/{id}', [PostController::class, 'update'])->name('post.update');
    Route::get('/post/download/{id}', [PostController::class, 'download'])->name('post.download');
    Route::post('/post/batch/store', [PostController::class, 'batchStore'])->name('post.batch-store');
    Route::delete('/post/{id}', [PostController::class, 'destroy'])->name('post.destroy');
    Route::get('/post/batch/downloadMe', [PostController::class, 'batchDownloadAuthenticated'])->name('post.batch-download-auth');

    /**
     * Get Audio Blob
     */
    Route::post('/audio', [PostController::class, 'getAudio'])->name('post.audio');
});

Route::middleware(['auth', 'ajax', 'role.check'])->group(function () {
    /**
     * Admin Routes
     */
    Route::get('/post/index/admin', [PostController::class, 'indexAdmin'])->name('post.index-admin');
    Route::get('/post/batch/downloadAdmin', [PostController::class, 'batchDownload'])->name('post.batch-download-admin');
});

require __DIR__ . '/auth.php';
