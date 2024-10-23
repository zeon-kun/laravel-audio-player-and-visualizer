<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        /**
         * Create 5 for development
         * Create 100 for production
         */
        for ($i = 1; $i <= 5; $i++) {
            User::create([
                'name' => 'User ' . $i,
                'email' => 'kelompok' . $i . '@identifier.id',
                'password' => Hash::make('password123'),
                'isAdmin' => false,
                'email_verified_at' => now(),
                'remember_token' => Str::random(10),
            ]);
        }
    }
}
