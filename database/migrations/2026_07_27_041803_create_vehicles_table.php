<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();

            $table->foreignId('customer_id')
                ->constrained()
                ->restrictOnDelete();

            $table->string('registration_no', 30)->unique();
            $table->string('make', 100);
            $table->string('model', 100);
            $table->unsignedSmallInteger('year');
            $table->string('vin', 17)->nullable()->unique();
            $table->unsignedInteger('mileage')->default(0);
            $table->timestamps();

            $table->index(['make', 'model']);
            $table->index('year');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};