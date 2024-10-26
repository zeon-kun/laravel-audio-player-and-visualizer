<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PostController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


// Disable browser parameter request (only axios or fetch hit)
Route::middleware(['auth'])->group(function () {
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

Route::middleware(['auth', 'role.check'])->group(function () {
    /**
     * Admin Routes
     */
    Route::get('/post/index/admin', [PostController::class, 'indexAdmin'])->name('post.index-admin');
    Route::get('/post/batch/downloadAdmin', [PostController::class, 'batchDownload'])->name('post.batch-download-admin');
});
