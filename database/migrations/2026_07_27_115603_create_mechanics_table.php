<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mechanics', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->nullable()
                ->unique()
                ->constrained()
                ->nullOnDelete();

            $table->string('employee_id', 30)->unique();
            $table->string('name', 100);
            $table->string('specialization', 150);
            $table->string('contact', 30);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('name');
            $table->index('specialization');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mechanics');
    }
};