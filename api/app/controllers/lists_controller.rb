# frozen_string_literal: true

class ListsController < ApplicationController
  def create
    board = Board.find(params[:board_id])
    list = board.lists.new(list_params)
    if list.save
      render json: serialize_list(list), status: :created
    else
      render_validation_errors(list)
    end
  end

  def update
    list = List.includes(:cards).find(params[:id])
    if list.update(list_params)
      render json: serialize_list(list)
    else
      render_validation_errors(list)
    end
  end

  def destroy
    list = List.find(params[:id])
    list.destroy
    head :no_content
  end

  private

  def list_params
    params.require(:list).permit(:title, :position)
  end

  def serialize_list(list)
    list.as_json(include: :cards).tap do |payload|
      payload['cards'] = ordered_cards(list.cards).map(&:as_json)
    end
  end

  def ordered_cards(cards)
    Array(cards).sort_by { |card| [card.position || 0, card.id] }
  end
end
