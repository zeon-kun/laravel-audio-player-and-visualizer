<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AjaxOnly
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Check if the request is an AJAX request
        if (!$request->ajax()) {
            // Return a 403 forbidden response for non-AJAX requests
            return response()->json(['error' => 'Forbidden. This route only accepts AJAX requests.'], 403);
        }

        return $next($request);
    }
}
