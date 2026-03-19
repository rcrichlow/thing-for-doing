# frozen_string_literal: true

class WorkingMemoryEntriesController < ApplicationController
  def index
    entries = WorkingMemoryEntry.all
    render json: serialize_entries(entries)
  end

  def create
    entry = WorkingMemoryEntry.new(entry_params)
    if entry.save
      render json: serialize_entries(entry), status: :created
    else
      render_validation_errors(entry)
    end
  end

  def update
    entry = WorkingMemoryEntry.find(params[:id])
    if entry.update(entry_params)
      render json: serialize_entries(entry)
    else
      render_validation_errors(entry)
    end
  end

  def destroy
    entry = WorkingMemoryEntry.find(params[:id])
    entry.destroy
    head :no_content
  end

  def destroy_all
    WorkingMemoryEntry.destroy_all
    head :no_content
  end

  private

  def entry_params
    params.require(:entry).permit(:content)
  end

  def serialize_entries(records)
    records.as_json
  end
end
