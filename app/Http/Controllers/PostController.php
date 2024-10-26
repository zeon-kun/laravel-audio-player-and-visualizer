<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Helpers\Result;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use ZipArchive;

class PostController extends Controller
{
    public function index(Request $request)
    {
        /** If use inertia page directly change to this */
        // try {
        //     $posts = Post::where('user_id', auth()->id())->get();
        //     return Inertia::render('Dashboard', [
        //         'posts' => $posts,
        //         'auth' => auth()->check() ? request()->user() : null
        //     ]);
        // } catch (\Exception $e) {
        //     return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        // }

        /** We are implementing using json return */
        try {
            $pageSize = $request->query('per_page', 10);
            $posts = Post::where('user_id', auth()->id())->paginate($pageSize);
            return response()->json(Result::success($posts, 200));
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function indexAdmin(Request $request)
    {
        /** We are implementing using json return */
        try {
            $pageSize = $request->query('per_page', 10);
            $posts = Post::paginate($pageSize);
            return response()->json(Result::success($posts, 200));
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:100',
            'description' => 'nullable|string|max:100',
            'audio_file' => 'required|mimes:mp3,wav|max:10240', // Maximum 10MB
        ]);

        try {
            $path = $request->file('audio_file')->store('audio_files');

            $post = Post::create([
                'title' => $request->title,
                'description' => $request->description,
                'audio_path' => $path,
                'user_id' => auth()->id(),
            ]);

            return redirect()->route('dashboard')->with('success', Result::success([
                'message' => 'Post created successfully',
                'post' => $post,
            ]));
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(Result::fail($e->getMessage()));
        }
    }

    public function batchStore(Request $request)
    {
        $request->validate([
            'audio_zip' => 'required|mimes:zip|max:20480', // Maximum 20MB
            'description' => 'nullable|string|max:100',
        ]);

        try {
            // Step 1: Store the uploaded ZIP file
            $zipPath = $request->file('audio_zip')->store('audio_zips');

            // Step 2: Extract the ZIP file
            $zip = new ZipArchive();
            if ($zip->open(storage_path('app/' . $zipPath)) === TRUE) {
                $extractPath = storage_path('app/extracted_audio_files/');
                $zip->extractTo($extractPath);
                $zip->close();
            } else {
                return response()->json(Result::fail('Failed to open the ZIP file'), 500);
            }

            // Step 3: Loop through extracted files
            $files = scandir($extractPath);
            $allowedExtensions = ['mp3', 'wav'];
            $posts = [];
            foreach ($files as $file) {
                $filePath = $extractPath . $file;

                // Only process valid audio files
                if (is_file($filePath) && in_array(pathinfo($file, PATHINFO_EXTENSION), $allowedExtensions)) {
                    // Store each audio file in the storage folder
                    $storedFilePath = Storage::putFile('audio_files', new \Illuminate\Http\File($filePath));

                    // Create a Post entry for each audio file
                    $post = Post::create([
                        'title' => pathinfo($file, PATHINFO_FILENAME), // Use file name as title
                        'description' => $request->description ?? null,
                        'audio_path' => $storedFilePath,
                        'user_id' => auth()->id(),
                    ]);

                    $posts[] = $post;
                }
            }

            // Step 4: Clean up extracted files
            foreach ($files as $file) {
                if (is_file($extractPath . $file)) {
                    unlink($extractPath . $file);
                }
            }

            return redirect()->route('dashboard')->with('success', Result::success([
                'message' => 'Post created successfully',
                'post' => $posts,
            ]));
        } catch (\Exception $e) {
            return response()->json(Result::fail($e->getMessage()), 500);
        }
    }

    public function show($id)
    {
        try {
            $post = Post::with('user')->findOrFail($id);
            return response()->json(Result::success($post), 200);
        } catch (\Exception $e) {
            return response()->json(Result::fail($e->getMessage()), 500);
        }
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
        ]);

        try {
            $post = Post::findOrFail($id);

            $post->update([
                'title' => $request->title ?? $post->title,
                'description' => $request->description ?? $post->description,
            ]);

            return redirect()->route('dashboard')->with('success', 'Post updated successfully');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        try {
            $post = Post::findOrFail($id);
            Storage::delete($post->audio_path);
            $post->delete();

            return redirect()->route('dashboard')->with('success', 'Post deleted successfully');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function download($id)
    {
        try {
            $post = Post::findOrFail($id);
            if (Storage::exists($post->audio_path)) {
                return Storage::download($post->audio_path);
            } else {
                return response()->json(Result::fail('Audio file not found.'), 404);
            }
        } catch (\Exception $e) {
            return response()->json(Result::fail($e->getMessage()), 500);
        }
    }

    public function batchDownloadAuthenticated()
    {
        try {
            Log::info("testTING");
            // Get only the authenticated user's posts
            $posts = Post::where('user_id', auth()->id())->get();

            if ($posts->isEmpty()) {
                return response()->json(Result::fail('No audio files found.'), 404);
            }

            $zip = new \ZipArchive();
            $zipFileName = 'audio_files_' . time() . '.zip';
            $zipPath = storage_path('app/temp/' . $zipFileName);

            // Ensure the temp directory exists
            if (!Storage::exists('temp')) {
                Storage::makeDirectory('temp');
            }

            if ($zip->open($zipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== TRUE) {
                throw new \Exception('Could not create zip file');
            }

            $hasFiles = false;

            foreach ($posts as $post) {
                $audioPath = storage_path('app/' . $post->audio_path);

                if (file_exists($audioPath)) {
                    // Add file with a sanitized name to prevent path traversal
                    $fileName = basename($post->audio_path);
                    $safeFileName = preg_replace('/[^a-zA-Z0-9._-]/', '', $fileName);

                    // Add the file to zip with the post title as the filename
                    $zip->addFile($audioPath, $post->title . '_' . $safeFileName);
                    $hasFiles = true;
                }
            }

            $zip->close();

            if (!$hasFiles) {
                // Clean up the empty zip file
                if (file_exists($zipPath)) {
                    unlink($zipPath);
                }
                return response()->json(Result::fail('No valid audio files found.'), 404);
            }

            // Send the file and then delete it
            return response()->download($zipPath)->deleteFileAfterSend(true);
        } catch (\Exception $e) {
            Log::error('Batch download failed: ' . $e->getMessage());

            // Clean up any partial zip file
            if (isset($zipPath) && file_exists($zipPath)) {
                unlink($zipPath);
            }

            return response()->json(Result::fail('Failed to create zip file: ' . $e->getMessage()), 500);
        }
    }

    public function batchDownload()
    {
        try {
            // Log::info("testTING from admin download");
            $posts = Post::all();

            if ($posts->isEmpty()) {
                return response()->json(Result::fail('No audio files found.'), 404);
            }

            $zip = new \ZipArchive();
            $zipFileName = 'audio_files_' . time() . '.zip';
            $zipPath = storage_path('app/temp/' . $zipFileName);

            // Ensure the temp directory exists
            if (!Storage::exists('temp')) {
                Storage::makeDirectory('temp');
            }

            if ($zip->open($zipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== TRUE) {
                throw new \Exception('Could not create zip file');
            }

            $hasFiles = false;

            foreach ($posts as $post) {
                $audioPath = storage_path('app/' . $post->audio_path);

                if (file_exists($audioPath)) {
                    // Add file with a sanitized name to prevent path traversal
                    $fileName = basename($post->audio_path);
                    $safeFileName = preg_replace('/[^a-zA-Z0-9._-]/', '', $fileName);

                    // Add the file to zip with the post title as the filename
                    $zip->addFile($audioPath, $post->title . '_' . $safeFileName);
                    $hasFiles = true;
                }
            }

            $zip->close();

            if (!$hasFiles) {
                // Clean up the empty zip file
                if (file_exists($zipPath)) {
                    unlink($zipPath);
                }
                return response()->json(Result::fail('No valid audio files found.'), 404);
            }

            // Send the file and then delete it
            return response()->download($zipPath)->deleteFileAfterSend(true);
        } catch (\Exception $e) {
            Log::error('Batch download failed: ' . $e->getMessage());

            // Clean up any partial zip file
            if (isset($zipPath) && file_exists($zipPath)) {
                unlink($zipPath);
            }

            return response()->json(Result::fail('Failed to create zip file: ' . $e->getMessage()), 500);
        }
    }

    public function getAudio(Request $request)
    {
        $request->validate([
            'audio_path' => 'required|string'
        ]);

        $audioPath = $request->input('audio_path');

        // Ensure the path exists and is accessible
        if (!Storage::exists($audioPath)) {
            return response()->json(['error' => 'Audio file not found'], 404);
        }

        // Get the file mime type
        $mime = Storage::mimeType($audioPath);

        // Return the file with proper headers
        return response()->file(
            Storage::path($audioPath),
            ['Content-Type' => $mime]
        );
    }
}
