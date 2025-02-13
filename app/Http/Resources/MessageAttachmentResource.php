<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class MessageAttachmentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */

     public static $wrap = false;
    public function toArray(Request $request): array
    {
        return[
            'id'=>$this->id,
            'message_id'=>$this->message_id,
            'name'=>$this->name,
            'mime'=>$this->mime,
            'size'=>$this->size,
            'url'=>Storage::url($this->path),
            'create_at'=>$this->create_at,
            'updated_at'=>$this->updated_at,
        ];
    }
}
