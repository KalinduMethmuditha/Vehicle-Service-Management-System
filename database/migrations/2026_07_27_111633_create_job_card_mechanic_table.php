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
        Schema::create('job_card_mechanic', function (Blueprint $table) {
             $table->id();

           $table->foreignId('job_card_id')
            ->constrained()
            ->cascadeOnDelete();

           $table->foreignId('mechanic_id')
             ->constrained()
             ->restrictOnDelete();

           $table->timestamps();

           $table->unique(['job_card_id', 'mechanic_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_card_mechanic');
    }
};
