<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('job_cards', function (Blueprint $table) {
            $table->id();
            $table->string('job_number')->nullable()->unique();

            $table->foreignId('service_booking_id')
               ->unique()
               ->constrained()
               ->restrictOnDelete();

            $table->text('diagnosis')->nullable();
            $table->text('work_description')->nullable();
            $table->decimal('labor_cost', 12, 2)->default(0);
            $table->string('status', 30)->default('pending');
            $table->dateTime('started_at')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->dateTime('stock_deducted_at')->nullable();
            $table->text('completion_summary')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('completed_at');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_cards');
    }
};
