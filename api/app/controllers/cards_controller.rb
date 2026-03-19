# frozen_string_literal: true

class CardsController < ApplicationController
  def index
    cards = Card.all
    render json: serialize_cards(cards)
  end

  def show
    card = Card.find(params[:id])
    render json: serialize_cards(card)
  end

  def create
    list = List.find(params[:list_id])
    card = list.cards.new(card_params)
    if card.save
      render json: serialize_cards(card), status: :created
    else
      render_validation_errors(card)
    end
  end

  def update
    card = Card.find(params[:id])
    if reorder_request?
      card.move_to_position!(
        target_list_id: card_params[:list_id] || card.list_id,
        target_position: card_params[:position]
      )
      render json: serialize_cards(card)
    elsif card.update(card_params)
      render json: serialize_cards(card)
    else
      render_validation_errors(card)
    end
  rescue ActiveRecord::RecordInvalid
    render_validation_errors(card)
  end

  def destroy
    card = Card.find(params[:id])
    card.destroy
    head :no_content
  end

  private

  def card_params
    params.require(:card).permit(:title, :description, :position, :list_id)
  end

  def serialize_cards(records)
    records.as_json
  end

  def reorder_request?
    card_params.key?(:position) || card_params.key?(:list_id)
  end
end
